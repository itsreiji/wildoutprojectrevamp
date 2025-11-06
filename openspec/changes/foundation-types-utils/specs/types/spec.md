## ADDED Requirements

### Requirement: TypeScript Type Definitions
The application SHALL provide centralized TypeScript type definitions for all data models used throughout the application.

#### Scenario: Type definitions are organized by domain
- **WHEN** a developer needs to use Event, TeamMember, Partner, or other data types
- **THEN** they can import them from dedicated type files in `src/types/`
- **AND** types are organized by domain (events.ts, team.ts, partners.ts, content.ts, settings.ts)

#### Scenario: Types are exported from a central index
- **WHEN** a developer imports types
- **THEN** they can use `import { Event, TeamMember } from '@/types'` for convenience
- **AND** individual type files are also directly importable

### Requirement: Event Type Definition
The Event type SHALL represent a complete event with all required fields for the WildOut! platform.

#### Scenario: Event type includes all required fields
- **WHEN** an Event object is created
- **THEN** it includes: id, title, description, date, time, venue, venueAddress, image, category, capacity, attendees, price, artists array, gallery array, highlights array, and status
- **AND** all fields are properly typed (string, number, array, union types)

### Requirement: Team Member Type Definition
The TeamMember type SHALL represent a team member with contact information and role details.

#### Scenario: TeamMember type includes all required fields
- **WHEN** a TeamMember object is created
- **THEN** it includes: id, name, role, email, optional phone, bio, optional photoUrl, and status
- **AND** status is a union type of 'active' | 'inactive'

### Requirement: Partner Type Definition
The Partner type SHALL represent a brand partner or sponsor.

#### Scenario: Partner type includes all required fields
- **WHEN** a Partner object is created
- **THEN** it includes: id, name, category, website, and status
- **AND** status is a union type of 'active' | 'inactive'

### Requirement: Content Type Definitions
The application SHALL provide types for HeroContent, AboutContent, and GalleryImage.

#### Scenario: HeroContent type includes stats
- **WHEN** a HeroContent object is created
- **THEN** it includes: title, subtitle, description, and stats object with events, members, and partners counts

#### Scenario: AboutContent type includes story and features
- **WHEN** an AboutContent object is created
- **THEN** it includes: title, subtitle, story array, foundedYear, and features array

#### Scenario: GalleryImage type includes metadata
- **WHEN** a GalleryImage object is created
- **THEN** it includes: id, url, caption, uploadDate, and optional event reference

### Requirement: Settings Type Definition
The SiteSettings type SHALL represent global site configuration.

#### Scenario: SiteSettings type includes contact and social media
- **WHEN** a SiteSettings object is created
- **THEN** it includes: siteName, siteDescription, tagline, email, phone, address, and socialMedia object with platform links

