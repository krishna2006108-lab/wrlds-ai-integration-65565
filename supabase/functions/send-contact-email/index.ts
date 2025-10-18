import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: ContactRequest = await req.json();

    console.log("Processing contact form submission from:", email);

    // Send notification to Krishna
    const notificationEmail = await resend.emails.send({
      from: "Zarvoxa Contact Form <onboarding@resend.dev>",
      to: ["krishna2006108@gmail.com"],
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #000000;">New Contact Form Submission</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #333333;">
            You have received a new message from the Zarvoxa contact form.
          </p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <hr style="border: none; border-top: 1px solid #dddddd; margin: 15px 0;">
            <p style="margin: 0; font-size: 16px;"><strong>Message:</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 15px; color: #333333; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="font-size: 14px; color: #666666;">
            You can reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    console.log("Contact notification email sent:", notificationEmail);

    // Send confirmation email to the user
    const confirmationEmail = await resend.emails.send({
      from: "Zarvoxa <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #000000;">Thank you for contacting us!</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #333333;">
            Hi ${name},
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333333;">
            We've received your message and will get back to you as soon as possible.
          </p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;"><strong>Your message:</strong></p>
            <p style="margin: 0; font-size: 14px; color: #333333; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="font-size: 16px; line-height: 1.6; color: #333333;">
            If you have any urgent questions, feel free to reach out directly at 
            <a href="mailto:team@zarvoxa.com" style="color: #0066cc;">team@zarvoxa.com</a>
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
            <p style="font-size: 14px; color: #666666;">
              Best regards,<br>
              The Zarvoxa Team
            </p>
          </div>
        </div>
      `,
    });

    console.log("Confirmation email sent:", confirmationEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationEmailId: notificationEmail.data?.id,
        confirmationEmailId: confirmationEmail.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
