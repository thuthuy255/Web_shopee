using ProductAPI.IServices;
using System.Net.Mail;
using System.Net;

namespace ProductAPI.Services
{
    public class EmailService : IEmailService
    {
        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var fromEmail = "thuychi251004@gmail.com";
            var password = "b e c l f t z j l t j t f o e v";

            var smtp = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(fromEmail, password),
                EnableSsl = true
            };

            var message = new MailMessage(fromEmail, toEmail, subject, body);
            await smtp.SendMailAsync(message);
        }
    }
}
