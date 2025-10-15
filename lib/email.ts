import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.NEXT_PUBLIC_SMTP_USER, // Your email
    pass: process.env.NEXT_PUBLIC_SMTP_PASS, // Your email password or app password
  },
});

// Verify transporter configuration
transporter.verify((error: any, success: any) => {
  if (error) {
    console.error("SMTP configuration error:", error);
  } else {
    console.log("SMTP server is ready to take our messages");
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<boolean> {
  try {
    const mailOptions: EmailOptions = {
      to,
      subject,
      text,
      html: html || text, // Use HTML if provided, otherwise use text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

// Specific email templates
export async function sendPasswordResetEmail(
  email: string,
  verificationCode: string
): Promise<boolean> {
  const subject = "إعادة تعيين كلمة المرور - لمة";
  const text = `رمز التحقق لإعادة تعيين كلمة المرور: ${verificationCode}`;
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6A0DAD 0%, #4A0A8A 100%); padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: #FCCB97; margin: 0; font-size: 28px;">لمة</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">منصة الألعاب التفاعلية</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">إعادة تعيين كلمة المرور</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          مرحباً بك،
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          لقد تلقيت هذا البريد الإلكتروني لأنك طلبت إعادة تعيين كلمة المرور لحسابك في منصة لمة.
        </p>
        
        <div style="background: #fff; border: 2px solid #6A0DAD; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;">رمز التحقق:</p>
          <div style="background: #6A0DAD; color: white; font-size: 24px; font-weight: bold; padding: 15px; border-radius: 5px; letter-spacing: 3px;">
            ${verificationCode}
          </div>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          استخدم هذا الرمز لإعادة تعيين كلمة المرور الخاصة بك. هذا الرمز صالح لمدة 15 دقيقة فقط.
        </p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <p style="color: #856404; font-size: 14px; margin: 0;">
            <strong>ملاحظة مهمة:</strong> إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          © 2024 لمة - منصة الألعاب التفاعلية. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  `;

  return await sendEmail(email, subject, text, html);
}

export async function sendWelcomeEmail(
  email: string,
  username: string
): Promise<boolean> {
  const subject = "مرحباً بك في لمة - تم إنشاء حسابك بنجاح";
  const text = `مرحباً ${username}، تم إنشاء حسابك في منصة لمة بنجاح!`;
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6A0DAD 0%, #4A0A8A 100%); padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: #FCCB97; margin: 0; font-size: 28px;">لمة</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">منصة الألعاب التفاعلية</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">مرحباً بك في لمة!</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          مرحباً <strong>${username}</strong>،
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          تم إنشاء حسابك في منصة لمة بنجاح! نحن سعداء لانضمامك إلينا في رحلة الألعاب التفاعلية المثيرة.
        </p>
        
        <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <p style="color: #2e7d32; font-size: 14px; margin: 0;">
            <strong>✅ حسابك مفعل ومستعد للاستخدام</strong>
          </p>
        </div>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          يمكنك الآن الاستمتاع بجميع الألعاب المتاحة على المنصة، بما في ذلك:
        </p>
        
        <ul style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          <li>لعبة لمة - أسئلة وأجوبة تفاعلية</li>
          <li>لعبة المافيا - لعبة استراتيجية ممتعة</li>
          <li>والمزيد من الألعاب القادمة!</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }" 
             style="background: #6A0DAD; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            ابدأ اللعب الآن
          </a>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          © 2024 لمة - منصة الألعاب التفاعلية. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  `;

  return await sendEmail(email, subject, text, html);
}

export default transporter;
