
<h1 align="center">
   Notifications API
</h1>

<h4 align="center">This repository represents a micro service, which is in charge of sending various notifications to the end users</h4>

<p align="center">
  <a href="#background">Background</a> •  
  <a href="#email-templates">Email templates</a> •  

</p>


## Background
* In this repository, I had implemented various methods of notifying end-users.
    -  Email (Including different email templates)
    -  WhatsApp
    -   SMS (Amazon Pinpoint)

## Email Templates
* As part of the email notifications mechanism, this service can send different email templates.
* The templates are stored in db as strings (html templates), and the right template is fetched upon request.
* In order to "transplant" the right data into the template placeholders, I created substitutionUtils.ts that takes care of all





