import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import nodemailer from "nodemailer";

// Initialize Express router and nodemailer transporter for sending emails
const router = express.Router();
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL_ID,
    pass: process.env.AUTH_EMAIL_PASSWORD,
  },
});

/* Supabase init */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// -------------------- REGISTRATION ENDPOINT --------------------
/**
 * Handles event registration for both individuals and teams.
 * - Validates required fields.
 * - For teams: validates all team members, checks for duplicate registration, inserts registration and team members.
 * - For individuals: inserts registration.
 * - Sends confirmation email after successful registration.
 */
router.post("/registrations", async (req, res) => {
  const { user_id, event_id, team_id, team_members } = req.body;
  let username = null;
  let usermail = null;
  let i = 2;

  // Check for required fields
  if (!user_id || !event_id) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    // ----------- TEAM REGISTRATION FLOW -----------
    if (team_members && team_id) {
      // Prepare to validate all team member emails
      const validatedMembers = [];
      const emailsToCheck = team_members
        .filter((m) => m.email && m.email.trim() !== "")
        .map((m) => m.email.trim());

      // Batch fetch user_ids for all team member emails
      if (emailsToCheck.length > 0) {
        const { data: foundUsers, error: fetchError } = await supabaseClient
          .from("user_participants")
          .select("user_id, email")
          .in("email", emailsToCheck);

        // If any error in fetching, abort registration
        if (fetchError) {
          console.error("Error fetching team members in batch:", fetchError);
          return res
            .status(400)
            .json({ success: false, message: "Error validating team members" });
        }

        // Map emails to user_ids for quick lookup
        const emailToUserId = {};
        for (const u of foundUsers || []) {
          if (u && u.email) emailToUserId[u.email.toLowerCase()] = u.user_id;
        }

        // Validate each team member exists in DB
        let idx = 2;
        for (const member of team_members) {
          if (!member.email || member.email.trim() === "") {
            idx++;
            continue;
          }
          const uid = emailToUserId[member.email.trim().toLowerCase()];
          if (!uid) {
            // If any member is not registered, abort registration
            return res.status(400).json({
              success: false,
              message: `Member ${idx} (${member.email}) is not registered!`,
            });
          }
          validatedMembers.push({ user_id: uid, email: member.email.trim() });
          idx++;
        }
      }

      for (const member of validatedMembers) {
        const { data: reg, error } = await supabaseClient
          .from("event_registrations")
          .select("registration_id")
          .eq("user_id", member.user_id)
          .eq("event_id", event_id)
          .maybeSingle();

        if (error) {
          console.error("Error checking team member registration:", error);
          return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
        }

        if (reg) {
          return res.status(400).json({
            success: false,
            message: `Team member ${member.email} is already registered for this event!`,
          });
        }
      }

      // Check if the main user is already registered for this event
      const { data: existingReg, error: checkError } = await supabaseClient
        .from("event_registrations")
        .select("registration_id")
        .eq("user_id", user_id)
        .eq("event_id", event_id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing registration:", checkError);
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }

      if (existingReg) {
        // Prevent duplicate registration
        return res.status(400).json({
          success: false,
          message: "You are already registered for this event!",
        });
      }

      // Insert registration for the main user (team leader)
      const { data: regInsertData, error: regInsertErr } = await supabaseClient
        .from("event_registrations")
        .insert({ user_id, event_id, team_id })
        .select("registration_id")
        .maybeSingle();

      if (regInsertErr) {
        console.error("Error inserting event registration:", regInsertErr);
        return res.status(500).json({
          success: false,
          message: "Registration failed",
          error: regInsertErr,
        });
      }

      // Store registration id for possible rollback
      const insertedRegistrationId = regInsertData
        ? regInsertData.registration_id
        : null;

      // Prepare all team members (including leader) for insertion
      const newTeamMembers = validatedMembers.map((member) => ({
        team_id,
        event_id,
        user_id: member.user_id,
      }));
      // Add the registering user as a team member
      newTeamMembers.push({ team_id, event_id, user_id });

      // Insert all team members into team_members table
      const { error: insertTeamError } = await supabaseClient
        .from("team_members")
        .insert(newTeamMembers);

      if (insertTeamError) {
        // If team_members insert fails, rollback registration
        console.error(
          "Error inserting team_members; attempting rollback of registration",
          insertTeamError
        );
        try {
          if (insertedRegistrationId) {
            // Delete registration by id
            await supabaseClient
              .from("event_registrations")
              .delete()
              .eq("registration_id", insertedRegistrationId);
          } else {
            // Fallback: delete by unique triplet
            await supabaseClient
              .from("event_registrations")
              .delete()
              .match({ user_id, event_id, team_id });
          }
        } catch (rbErr) {
          console.error("Rollback failed:", rbErr);
        }

        return res.status(500).json({
          success: false,
          message: "Failed to insert team members; registration rolled back",
          error: insertTeamError,
        });
      }
    } else {
      // ----------- INDIVIDUAL REGISTRATION FLOW -----------

      const { data: existingReg, error: checkError } = await supabaseClient
        .from("event_registrations")
        .select("registration_id")
        .eq("user_id", user_id)
        .eq("event_id", event_id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing registration:", checkError);
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }

      if (existingReg) {
        return res
          .status(400)
          .json({
            success: false,
            message: "You are already registered for this event!",
          });
      }

      // Proceed to insert
      const { data, error } = await supabaseClient
        .from("event_registrations")
        .insert({ user_id, event_id })
        .select("registration_id")
        .maybeSingle();

      // (No rollback needed for individual)
    }

    // ----------- SEND CONFIRMATION EMAIL -----------
    // Fetch event details for email content
    const { data: eventdata, error: e } = await supabaseClient
      .from("events")
      .select("grp_link, name")
      .eq("event_id", event_id);
    if (e) console.error(e);

    // Fetch user details for email
    const { data: userdata, error: err } = await supabaseClient
      .from("user_participants")
      .select("name, email")
      .eq("user_id", user_id);
    if (err) console.error("Error fetching from user_participants : ", err);

    // Use first name for personalization

    if (!userdata || userdata.length === 0)
      return res.status(500).json({ message: "User not found" });

    userdata[0].name = userdata[0].name.split(" ")[0];
    username = userdata[0].name;
    usermail = userdata[0].email;

    //Accessing eventdata[0] without checking
    if (!eventdata || eventdata.length === 0)
      return res.status(500).json({ message: "Event not found" });

    // Send registration success email with WhatsApp group link
    await transporter.sendMail({
      from: process.env.AUTH_EMAIL_ID,
      to: usermail,
      subject: "Registration successful !",
      html: `
              <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-size: cover;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                        <tr>
                            <td align="center" style="padding: 20px;">
                                <table role="presentation" width="700px" cellspacing="0" cellpadding="0" border="0" style="background: #e1dce9; border-radius: 12px; box-shadow: 0px 5px 12px rgba(0, 0, 0, 0.2); overflow: hidden;">
                                    <tr>
                                        <td align="center" style="background: linear-gradient(to right, #0f0f0f, #6a11cb); padding: 30px;">
                                            <img src="https://yourwebsite.com/assets/imeet-logo.png" alt="ImeeT 2025" style="max-width: 120px; margin-bottom: 10px;">
                                            <h1 style="color: white; font-size: 24px; margin: 0;">You're Registered for ${eventdata[0].name} 🎉</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 25px; font-size: 16px; color: #333; line-height: 1.6; text-align: left;">
                                            <p>Dear <strong>${username}</strong>,</p>
                                            <p>Thank you for registering for <strong>${eventdata[0].name}</strong>! We're excited to have you with us.</p>
                                            <p>To stay updated with event details, discussions, and important announcements, join our WhatsApp group by clicking the button below.</p>
                                            
                                            <div style="text-align: center; margin: 25px 0;">
                                                <a href="${eventdata[0].grp_link}" style="display: inline-block; padding: 14px 30px; font-size: 16px; color: #ffffff; background: linear-gradient(to right, #6a11cb, #2575fc); text-decoration: none; border-radius: 6px; box-shadow: 0px 4px 8px rgba(106, 17, 203, 0.3); transition: 0.3s;">
                                                    Join WhatsApp Group
                                                </a>
                                            </div>
                                            
                                            <p>If you have any questions, feel free to reply to this email or reach out to us through the contact numbers given on the website.</p>
                                            <p>See you at the event! 🎊</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="background: #0f0f0f; padding: 20px; text-align: center; color: #bbb; font-size: 12px;">
                                            Best Regards,<br>
                                            <strong style="color: #ffffff; display: inline-block; margin-top: 8px;">Team ImeeT</strong>
                                        </td>                            
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </body>
            `,
    });

    // ----------- FINAL RESPONSE -----------
    return res
      .status(201)
      .json({ success: true, message: "Registration successful" });
  } catch (error) {
    // Catch-all error handler
    console.error("Server error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// -------------------- TEAM CREATION ENDPOINT --------------------
/**
 * Creates a new team for an event.
 * - Inserts a new team row in the teams table.
 * - Returns the new team_id if successful.
 */
router.post("/create-team", async (req, res) => {
  const { event_id, team_name } = req.body;
  try {
    const { data, error } = await supabaseClient
      .from("teams")
      .insert({ event_id, team_name })
      .select("team_id");
    if (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error inserting team", error });
    }

    if (data && data.length > 0) {
      return res.status(200).json({ success: true, team_id: data[0].team_id });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "No team created" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

// -------------------- TEAM DELETION ENDPOINT --------------------
/**
 * Deletes a team by team_name.
 * - Validates input.
 * - Deletes the team from the teams table.
 * - Returns success or error message.
 */
router.post("/delete-team", async (req, res) => {
  const { team_name } = req.body;

  // Validate input
  if (!team_name) {
    return res
      .status(400)
      .json({ success: false, message: "Team name is required" });
  }

  try {
    // Delete team by name
    const { data, error } = await supabaseClient
      .from("teams")
      .delete()
      .eq("team_name", team_name)
      .select();

    if (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error deleting team", error });
    }

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Team deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

export default router;
