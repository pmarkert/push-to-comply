# push-to-comply

GRC (Governance, Risk, and Compliance) meets DevOps - **git push** to comply.

Manage your compliance program by:

- Cloning this repository.
- Tracking policies, procedures, and narratives as source(-code).
- Using pull-requests to merge reviews and manage approvals.
- Rendering documentation and evidence for auditors.
- Generating issue tickets to track recurring procedures.
- Exposing a secure API allowing procedures to be triggered by personnel or external systems.

## Table of Contents

- [Purpose](#purpose)
  - [Compliance Documentation Portal](#compliance-documentation-portal)
  - [Ticketing for Recurring Procedures](#ticketing-for-recurring-procedures)
- [Standards](#standards)
- [Controls](#controls)
  - [Mapping Controls to Standards Criteria](#mapping-controls-to-standards-criteria)
  - [Policies and Narratives](#policies-and-narratives)
  - [Procedures](#procedures)
    - [`cron` property](#cron-property)
    - [`dynamic_fields` property](#dynamic_fields-property)
- [Context](#context)
  - [Static Context](#static-context)
  - [Dynamic Context (for Procedures)](#dynamic-context-for-procedures)
  - [Date Context](#date-context)
  - [GitHub Context](#github-context)
- [Layouts](#layouts)
  - [Pages](#pages)
  - [Partials](#partials)
- [Assets](#assets)
- [Customization](#customization)
  - [Triggering on-demand procedures](#triggering-on-demand-procedures)
  - [Options for documentation website publishing](#options-for-documentation-website-publishing)

## Purpose and Features

Push-to-comply helps organizations track and manage their compliance program.

Out of the box, push-to-comply provides all features (ticketing, notifications, approvals, reviews, documentation, and publishing) using GitHub hosted features and services. It should be a relatively straight-forward effort to swap out the publishing and/or ticketing features to integrate with other systems. The project offers hooks and features allowing for easy customization, branding, and configuration.

### Compliance Documentation Portal

push-to-comply generates a static HTML website that can be used to:

- view/print/download standards and the mapping of controls that satisfy criteria.
- view/print/download control documents.
- [optional]: navigate to the historical log of tracking tickets for each procedure.
- [optional]: manually trigger on-demand procedure tickets.

Out of the box configuration allows the compliance documentation portal to be published to a GitHub pages site for public repositories. While having this information publicly visible may be appropriate for open-source projects, non-profit organizations, or small businesses; most organizations will likely prefer to keep the repository and generated documentation website private. Alternative publishing options can be easily configured. See [Customization: Published Website](#options-for-documentation-website-publishing).

### Ticketing for Recurring Procedures

push-to-comply includes an automatic ticket scheduling service that creates issues/tickets for recurring procedures that need to be tracked. For example, an organization might have procedures to check user-access logs once per month, or review infosec policies once per year. Remembering to execute these recurring tasks, assigning them, and tracking the evidence of completion is the key to an auditable compliance process.

Push-to-comply makes procedure tracking easy by generating GitHub issues each time a procedure needs to be executed. Procedures may be scheduled to run on an automated basis or manually triggered in response to an external event. Procedure tickets can be assigned to specific personnel, labeled with specific categories, grouped under project milestones, etc. Procedure tickets are generated in the cloned push-to-comply repository by default, but may also be configured for a different repository. Separate repositories may even be configured for different procedures.

While GitHub Issues is a convenient ticketing system that integrates well, some organizations may prefer to publish to their own existing ticketing system. This should be relatively straight-forward to implement by creating an alternative TicketAdapter and implementing the basic methods: `generateTicket` and `procedureLastExecuted`. See [Customization: Ticketing System](#customization).

### Secure API to Invoke Procedures

push-to-comply procedures can be manually triggered/invoked using secure API calls. This uses GitHub actions to execute the on demand procedures in the same way that the automated scheduler runs. The Static Website includes a simple UI to invoke this API and trigger a procedure (if enabled). To get started with the API, see [Customization: Trigger Procedure API](#customization).

## Standards

Standards represent industry accepted best practices and rule-sets for achieving compliance. Standards definitions are based on [opencontrol schemas](https://github.com/opencontrol/standards). Opencontrol standards may be placed into the [standards/] folder as-is with a `.yaml` extension.

Standards may also be enhanced as markdown files. The opencontrol data should be placed under the `standard` property. A top-level `name` or `description` property may be used to provide a friendly display name for the standard. The markdown body of the file may be used to provide explanatory text or narrative about the standard.

## Controls

push-to-comply manages three types of controls:

- Narratives: describe the environment, guiding principals, context, and goals/objectives for the organization.
- Policies: describe the rules and guidelines that the organization must follow in order ot achieve its goals.
- Procedures: describe activities/tasks/checklists that must be executed on a recurring or as-needed basis for the organization to achieve its goals.

Controls are specified via human readable documents in the corresponding [controls/](controls/) subdirectory using [markdown syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax). Markdown allows for simplistic and easy formatting.

- [Policies](controls/policies/)
- [Narratives](controls/narratives/)
- [Procedures](controls/procedures/)

These markdown documents may contain a metadata header (see [YAML Front-matter](https://docs.github.com/en/contributing/writing-for-github-docs/using-yaml-frontmatter)) with machine-readable properties describing the control. This metadata is available to the layout templates when rendering the documentation website. Metadata properties are also used to configure API parameters when scheduling and generating tickets/issues (see [procedures](#procedures)).

```
---
# JSON or YAML formatted metadata is optional, but helpful.
name: Example Control Document
---

This is an example control document using [markdown](https://www.markdownguide.org/) to *format* content.
```

### Mapping controls to standards criteria

Controls may be mapped to show which compliance [standards](#standards) and [criteria](#criteria) they apply to. This mapping is established using a `satisfies` property in the control document's metadata. The `satisfies` property should be an object having keys which match the name of the standard and the values are an array of the specific criteria ids within the standard that are satisfied by the control. Controls may satisfy multiple criteria under multiple standards and vice-versa.

These mappings are turned into hyperlinks between the control document and associated criteria (and vice-versa) on the rendered documentation site.

Example:

```
---
name: Access Control Policy
satisfies:
  TSC:
    - CC6.1
    - CC6.2
  NIST-800-53:
    - AC-1
---

...Policy document...
```

### Policies and Narratives

Policies in [controls/policies/](controls/policies/) and narratives in [controls/narratives/](controls/narratives/) should be customized to fit the organization's needs. In addition to showing the criteria mappings, these documents will be rendered as formatted documents in the documentation portal.

Metadata properties are optional, and may be added to support formatting via layouts on the rendered website. The following properties are utilized by the included layouts:

| field           | description                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| `name`          | Used in the website listings and as a title for the document. If not specified, the filename will be used. |
| `version`       | If specified, will be displayed on the rendered control page.                                              |
| `approval_date` | If specified, will be displayed on the rendered control page.                                              |
| `owner`         | If specified, will be displayed on the rendered control page.                                              |
| `layout`        | Specifies a custom layout file to be used when rendering the document.                                     |
| `satisfies`     | Mapping of which standards and criteria within the standard to which the control applies.                  |
| other           | Additional properties are available to the layout/rendering process, but are otherwise ignored.            |

### Procedures

Procedures in [controls/procedures/](controls/procedures/) represent checklist items for recurring tasks that need to be tracked and executed. Procedure tickets can be automatically triggered via the scheduler or they can be triggered on-demand as needed. On-demand triggering can be invoked via GitHub's secure `workflow_dispatch` API. There is a UI in the rendered website (if enabled) that will allow users to invoke this, or it can be triggered via automation from external systems.

The `github` metadata property is used to set the proper API parameters when creating GitHub issues via the API.

| property             | notes                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `name`               | Used in the website listings and as a title for the document. If not specified the title or filename will be used. |
| `cron`               | A cron scheduler pattern for when tickets should be automatically generated                                        |
| `dynamic_fields`     | A list of any dynamic_context values that are required to run the procedure.                                       |
| `github`.`title`     | The title of the generated ticket. If not specified, the name or filename will be used.                            |
| `github`.`assignees` | An array of github usernames to assign to the ticket.                                                              |
| `github`.`labels`    | An array of labels to be added to the ticket. These labels will be combined with the automatic labels.             |
| `github`.`milestone` | The title of the milestone to which the ticket is assigned. (A milestone be created if it doesn't exist)           |
| `github`.`repo`      | Override the default github repository in which to create tickets.                                                 |
| `github`.`owner`     | Override the owner of the github repository in which to create tickets.                                            |
| other fields         | Additional properties are available to the layout/rendering process, but are otherwise ignored.                    |

- The body of the markdown file becomes the `body` of the ticket.

The body of a procedure should be a clear set of instructions (possibly a checklist) that makes it simple and easy for the assignee to accomplish the task.

#### `cron` property

The `cron` property will cause tickets for the procedure to be auto-generated according to the specified schedule.

> [!IMPORTANT]
>
> Unlike a continuously running cron daemon, the scheduler job runs on a periodic basis (by default, daily at 1 minute after midnight UTC). Each time the scheduler runs, tickets that should have been generated since the previous run will be created. As a result, procedures scheduled for a specific time of day will be generated next time the scheduler runs.

If the scheduler job is paused or fails to run, then each missing ticket (up to 3 per procedure) will be generated next time the job runs. The limit of 3 scheduled tickets per procedure, per scheduler-run prevents situations in which an improper cron expression, such as one specifying `*` for the hour or minute generates many unexpected tickets. If you have a need to generate more than 3 scheduled tickets per procedure each time the job runs, this limit can be changed with the TICKET_SAFETY_LIMIT environment variable, or the scheduler can be run multiple times per day.

The scheduler uses the most recent of the following dates to determine the ticket generation lookback window:

- The date of the most recently created ticket for the procedure (matched using the procedure-id and push-to-comply standards labels).
- The initial commit date of the procedure template.
- The value of the procedure's `start_date` property.
- The value of the `START_OF_COMPLIANCE` environment variable or `config.start_of_compliance` see [Config Static Context](#config-static-context).

> [!TIP]
>
> The rendered compliance portal provides human-readable descriptions of each procedure's schedule. This can be helpful when troubleshooting a schedule.

#### `dynamic_fields` property

Dynamic fields may be used in procedure templates to customize the generated ticket with replacement values specific to each instance in which the procedure is being triggered. Replacement values for these dynamic fields must be specified when calling the API to trigger the procedure see [Triggering on-demand Procedures](#triggering-on-demand-procedures).

In the following example, dynamic fields are used to specify

- `employee_name`: a newly hired employee's username
- `hire_date`: the start date for the employee
- `laptop_serial`: the employees new laptop serial number
- `hr_system_ticket_id`: a ticket id referenced ifrom some other system

```
---
name: Employee Newhire Onboarding
dynamic_fields: [ "employee_name", "hire_date", "laptop_serial", "hr_system_ticket_id" ]
---

Please execute onboarding processes for new hire {{employee_name}} [Official HR Approval Ticket](https://hr.example.org/newhire?ticket_id={{hr_system_ticket_id}}) before the start date of {{hire_date}}.  The inventory laptop serial # is {{laptop_serial}}
```

The list of dynamic field names used by the template must be declared in the metadata using a `dynamic_fields` array. The purpose of explicitly declaring the `dynamic_fields` is to:

- provide proper template validation (unexpected macros throw an error)
- render placeholders for the macros in the documentation website
- enable automatic generation of the expected form fields in the procedure trigger UI.

## Context

Control documents and layouts are processed using [Handlebars.js](https://Handlebarsjs.com) to replace macros for data fields. Handlebars `{{tokens}}` may be used to provide substitution values in both the YAML front-matter and markdown portions of control documents as well as in the HTML layouts.

> [!IMPORTANT]
>
> Handlebars templates are evaluated in strict mode so that missing macro values can be easily determined through an error message instead of finding missing/blank values in the rendered output. If you wish to make macro values optional, you can use the Handlebars `{{#if}}` helper.

The data for these macro replacements is called "context". The context object is merged from the following sources.

### Dynamic Context (for Procedures)

Dynamic context values must be passed in as inputs to the API when manually triggering an on-demand procedure. Dynamic context is useful for on-demand procedures that need to include macros for values that are only known at the time the procedure is being triggered. For example, an offboarding procedure for an employee might include the username of the employee, or a url/ticket number in an external system that you want to mention in the ticket. See [dynamic_fields property](#dynamic_fields-property)

### Static Context

Static context data for the template evaluation is read from YAML files under the [/context](/context) directory. Each context file is loaded under a property that matches the filename (minus the filename extension). For example, if the contents of [/context/contacts.yaml](/context/contacts.yaml) contain an object with a `name` property, this value would be available in the Handlebars templates as {{contacts.name}}.

Static context values are useful to provide replacement values for repetitive information such as the organization's name, contact information for key personnel, assignees for certain issue types, etc. Static context data is also useful for rendering text/branding values within the layout of the documentation site. You may add any static context values you like and use them in your templates.

While all static context is treated equally, two files have special significance:

#### GitHub Static Context

[/context/github.yaml](/context/github.yaml) can be used to specify an alternative GitHub repository in which to create procedure tickets. The yaml file should have a top-level `repo` and `owner` property.

#### Config Static Context

[/context/config.yaml](/context/config.yaml) can be used to override certain properties or control the behavior of the application as described elsewhere in this README.

### Date Context

The date context is automatically provided to make it easy to include date/time information in published documents or procedure tickets.

| property     | value                                                                       | format     |
| ------------ | --------------------------------------------------------------------------- | ---------- |
| now          | The time at which the ticket was triggered                                  | HH:mm:ss   |
| today        | The date on which the ticket was triggered                                  | yyyy-MM-dd |
| yesterday    | The day before the ticket was triggered                                     | yyyy-MM-dd |
| tomorrow     | The day after the ticket was triggered                                      | yyyy-MM-dd |
| this_month   | The 1st day of the month when the ticket was triggered                      | yyyy-MM    |
| last_month   | The 1st day of the month before the ticket was triggered                    | yyyy-MM    |
| next_month   | The 1st day of the month after the ticket was triggered                     | yyyy-MM    |
| this_quarter | The 1st day of the quarter in which the ticket was triggered                | yyyy-'Q'q  |
| last_quarter | The 1st day of the quarter before the one in which the ticket was triggered | yyyy-'Q'q  |
| next_quarter | The 1st day of the quarter after the one in which ticket was triggered      | yyyy-'Q'q  |
| this_year    | The 1st day of the year in which the ticket was triggered                   | yyyy       |
| last_year    | The 1st day of the year before the one in which the ticket was triggered    | yyyy       |
| next_year    | The 1st day of the year after the one in which the ticket was triggered     | yyyy       |

These date values can be inserted with their default format, as shown above, simply by referencing the field: (i.e. `{{now}}`, `{{this_quarter}}`), or the date can be formatted with a custom format string by invoking it as a handlebars helper `{{#today}}EEE, MMMM d, yyyy{{/today}}`.

## Layouts

Layouts use Handlebars.js to render the HTML pages for the static website.

### Pages

- index : The homepage of the portal
- standard : Display page about a standard
- control : Display page about a control document

### Partials

## Assets

## Customization

### Triggering on-demand procedures

GitHub provides a [workflow_dispatch](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#workflow_dispatch) RESTful API call that can be used to trigger procedures. The event_type parameter should be specified as `trigger_procedure` and the `client_payload` should be a JSON encoded object containing a `procedure` field with the id of the procedure to be triggered and keys/values for all `dynamic_fields` the procedure expects.

> [!NOTE]
>
> The procedure's ID is the subdirectory and filename without the markdown extension.

## Options for documentation website publishing:

- The included GitHub workflow [.github/workflows/render_site.yml](.github/workflows/render_site.yml) will automatically publish the static website to GitHub Pages if your repository is public.
- For this to work, the repository must either be public (GitHub pages does not work for private repositories), or you must be using GitHub Enterprise. Many organizations may not want the repository to be public, so you can easily adjust the to push the website to your own CMS or website hosting service, or publish an artifact that can be downloaded.
