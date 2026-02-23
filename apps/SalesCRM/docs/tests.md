# Sales CRM Test Specification

## ClientsListPage (/clients)

### Components
- Sidebar Navigation
- ClientsSearchAndFilters (search bar, Status dropdown, Tags dropdown, Source dropdown, Sort dropdown)
- ClientsActions (Import button, Export button, Add New Client button)
- ClientsTable (columns: Client Name, Type, Status, Tags, Primary Contact, Open Deals, Next Task, row action menu)
- Pagination

<!-- Test entries will be added by PlanComponent jobs -->

---

## ClientDetailPage (/clients/:clientId)

### Components
- ClientHeader (name, type badge, status badge, tags with edit pencil icon)
- QuickActions (Add Task, Add Deal, Add Attachment, Add Person buttons)
- SourceInfoSection (Acquisition Source, Campaign, Channel, Date Acquired, Edit button)
- TasksSection (unresolved tasks list with checkboxes, due dates, linked deals)
- DealsSection (deal entries with name, stage, value)
- AttachmentsSection (file list with type icon, filename, type label, created date, linked deal, download/view/delete actions)
- PeopleSection (list of associated individuals with avatar, name, role/title)
- TimelineSection (chronological feed: task created, note added, deal stage changed, email sent, contact added)

<!-- Test entries will be added by PlanComponent jobs -->

---

## PersonDetailPage (/individuals/:individualId)

### Components
- PersonHeader (name, title, associations, email, phone, location, associated clients links)
- RelationshipsSection (Graph View / List View tabs, relationship entries with name, type, title, client, Link; Filter button, Add Entry button)
- ContactHistorySection (chronological log with date/time, interaction type, summary, team member, edit icon; Filter button, Add Entry button)
- AssociatedClientsSection (client cards with icon, name, status, industry, View Client Detail Page button)

<!-- Test entries will be added by PlanComponent jobs -->

---

## DealsListPage (/deals)

### Components
- DealsSummaryCards (Total Active Deals, Pipeline Value, Won Q3 count+value, Lost Q3 count+value)
- DealsViewTabs (Table View, Pipeline View)
- DealsFilters (Stage dropdown, Client dropdown, Status dropdown, Date Range picker, Sort by dropdown, Search input)
- DealsTable (columns: Deal Name, Client, Stage, Owner, Value, Close Date, Status badge, row action menu)
- CreateDealButton
- Pagination

<!-- Test entries will be added by PlanComponent jobs -->

---

## DealDetailPage (/deals/:dealId)

### Components
- DealHeader (deal title, Client field, Value field, Owner field, Stage dropdown, Change Stage button)
- StageProgressBar (Lead, Qualification, Discovery, Proposal, Negotiation, Closed Won with visual progress)
- DealHistorySection (chronological stage change log with date/time, old stage, new stage, user)
- DealMetricsSection (Probability percentage, Expected Close date)
- WriteupsSection (entries with title, date, author, content summary, Edit button, Version History button; New Entry button)
- LinkedTasksSection (task list with checkboxes, task name, due date, completed status; Add Task button)
- DealAttachmentsSection (file list with filename, size, Download link, Delete link; upload button)
- DealContactsSection (person entries with avatar, name, role, client, View Profile link)

<!-- Test entries will be added by PlanComponent jobs -->

---

## TasksListPage (/tasks)

### Components
- TasksHeader (page title, New Task button)
- TasksFilter (filter type dropdown, text filter input)
- TasksList (task cards with priority badge color-coded High/Medium/Low/Normal, task name, due date, assignee avatar + name/role, action menu ...)

<!-- Test entries will be added by PlanComponent jobs -->
