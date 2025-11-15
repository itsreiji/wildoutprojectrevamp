## MODIFIED Requirements

### Requirement: Landing Page Content Synchronization
The public landing page SHALL display content that is synchronized with the admin dashboard in real-time, ensuring that any changes made in the admin interface are immediately reflected on the public site.

#### Scenario: Hero section updates sync instantly
- **WHEN** an admin updates the hero title in the dashboard
- **THEN** the landing page hero section SHALL display the updated title without requiring a page refresh
- **AND** the change SHALL persist across browser sessions and deployments

#### Scenario: About section content syncs automatically
- **WHEN** an admin modifies the about section content (title, story, features)
- **THEN** the landing page about section SHALL display the updated content immediately
- **AND** all visitors to the site SHALL see the updated content

#### Scenario: Site settings sync across all pages
- **WHEN** an admin updates site-wide settings (contact info, social media links)
- **THEN** all public pages SHALL reflect these changes immediately
- **AND** the footer and contact sections SHALL use the updated information

## ADDED Requirements

### Requirement: Admin Route Configuration
The application SHALL support configurable admin base paths to enable flexible deployment scenarios, with `/sadmin` as the default admin route prefix.

#### Scenario: Admin routes work under configurable path
- **WHEN** the application is configured with `VITE_ADMIN_BASE_PATH=/sadmin`
- **THEN** all admin dashboard routes SHALL be accessible under `/sadmin/*`
- **AND** the router SHALL correctly handle navigation within the admin section
- **AND** direct links to admin pages SHALL work properly
