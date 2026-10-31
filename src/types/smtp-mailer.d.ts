// A patched SMTP package is aliased so Auth.js's unused optional email-provider
// peer does not force the application onto an older Nodemailer major version.
declare module "smtp-mailer" {
  import nodemailer from "nodemailer";
  export default nodemailer;
}
