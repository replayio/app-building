App: Sales CRM
Initial Prompt: Basic CRM for tracking relationships with existing clients and prospects.  data structure:

Client (org or individual)
> source info
> tags
> next tasks / task history (can be associated with a deal)
> attachments (can be associated with a deal)
> individuals associated with the client
>> relationships with other individuals
>> history of contact with this individual
> current status (active / inactive / prospect / churned)
> deals
>> deal stage / history
>> writeups


Pages:

1. ClientsListPage (/clients)
   Description: A page listing all clients (organizations and individuals) in a tabular or card-based layout. Each row/card shows key summary fields: client name, type (org or individual), current status (active / inactive / prospect / churned), tags, primary contact, and possibly count of open deals and next task. Includes search, filtering (by status, tags, source, etc.), and sorting controls. Each client entry has an action to open the detailed Client page. There may be buttons to add a new client and import/export client data. Pagination or infinite scrolling is present for large client lists.
   Mockup: https://utfs.io/f/g4w5SXU7E8KdGYR2WqlmNZbhk6aHrIt10MDU8Rq9OgLJAvCf

2. ClientDetailPage (/clients/:clientId)
   Description: A detailed view for a single client (organization or individual). Multi section layout.

Top section: summary header with client name, type (org or individual), current status (active / inactive / prospect / churned), tags, can be clicked to edit.  quick actions (add task, add deal, add attachment, add person).

Source Info section: displays structured fields about how/where the client was acquired (e.g., referral, campaign, channel). Includes view/edit capability.

Tasks section: shows a list of unresolved tasks associated with the client. Each task may be optionally associated with a deal. Tasks can be clicked to open task detail page.

Deals section: shows any current deal for the client with its name, stage, and $ value.  Can be clicked to go to the deal's detail page.

Attachments section: lists files and links related to the client. Each attachment may optionally be associated with a deal. Displays filename, type, created date, and linked deal (if any), with download/view and delete options.

People section: lists individuals associated with this client (e.g., contacts within an organization or related people around an individual client). Each entry shows the person’s name, role/title, and can be clicked to go to the person's detail page.

Timeline section (optional but implied by histories): consolidated chronological feed of tasks, contact events, status changes, deal stage changes, and notes/writeups related to the client.  Each can be clicked to go to its detail page.
   Mockup: https://utfs.io/f/g4w5SXU7E8KdZvw32ApGkvBCJKoN0sMR1hwGF45DX7bVjHdu

3. PersonDetailPage (/individuals/:individualId)
   Description: A detailed page for a specific individual who is associated with one or more clients. May be reached from a client or from a global people listing (if present). Layout includes:

Header: individual’s name, role/title, primary contact information, and association(s) to clients.

Relationships with Other Individuals: a section or tab showing this individual’s relationships graph/list to other individuals (e.g., colleague, decision maker, influencer). Each relationship item shows the related person’s name, relationship type, and a link to that person’s detail.

History of Contact: a chronological log of interactions with this individual (emails, calls, meetings, notes). Each entry shows date/time, type of interaction, summary/notes, and possibly who on the team performed it. Includes ability to add/edit contact history entries.

Associated Clients section: list of clients this individual is associated with, with links back to the relevant Client Detail pages.
   Mockup: https://utfs.io/f/g4w5SXU7E8Kd6tTJNxrn27SvXDfJANF0dzKcZECW1mhuabTM

4. DealsListPage (/deals)
   Description: A page listing deals across all clients. The layout can be table-based or pipeline/board view by deal stage. Shows each deal’s name, associated client, current stage, owner, and key metrics. Provides filtering (by stage, client, status), sorting, and search. Includes button to create a new deal. Integrates deal stage summary counts and possibly totals by stage.
   Mockup: https://utfs.io/f/g4w5SXU7E8KdPKtynSfjDSRHCyvJs4Ih5EgFTpY2aun16btK

5. DealDetailPage (/deals/:dealId)
   Description: A detailed view for a specific deal. The layout includes:

Header: deal name, associated client, value (if used), owner, and current stage with controls to change stage.

Deal Stage / History section: visual indicator of the current stage in the pipeline plus a chronological history of stage changes (old stage, new stage, date/time, user). May also show probability and expected close date.

Writeups section: free-form or structured notes describing the deal context, needs, strategy, and updates. Supports multiple entries, editing, and possibly versioning.

Linked Tasks section: shows tasks specifically associated with this deal (which are also tied to the client). Allows adding/editing tasks and marking them complete.

Attachments section: lists attachments specifically linked to this deal (also visible in the client’s attachments section) with upload/download/delete actions.

Contacts/Individuals section: lists key individuals involved in the deal (decision makers, influencers), with links to their Individual Detail pages.
   Mockup: https://utfs.io/f/g4w5SXU7E8Kd0kqIkMnxTNlqb6OFiuMyICRwo9VUXgPnsJfA

6. TasksListPage (/tasks)
   Description: List of all upcoming tasks and their assignees.
   Mockup: https://utfs.io/f/g4w5SXU7E8KdtyoBqx46DymZogOnksH9L3PljQCzwVbrJdvA
