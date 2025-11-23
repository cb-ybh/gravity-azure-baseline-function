# Gravity Forms Field Mapping

## Form Field Reference

| Field Label                         | Parameter Name           | Description                                         |
| ----------------------------------- | ------------------------ | --------------------------------------------------- |
| Registration Type                   | `reg_type`               | Type of registration: `parent`, `player`, or `club` |
| Your Name (First)                   | `contact_first_name`     | Contact's first name                                |
| Your Name (Last)                    | `contact_last_name`      | Contact's last name                                 |
| Your Email                          | `contact_email`          | Contact's email address (required)                  |
| Your Phone                          | `contact_phone`          | Contact's phone number                              |
| School Name                         | `school_name`            | School name (for parent registrations)              |
| How many children                   | `school_no_of_children`  | Number of children (for parent registrations)       |
| Your club name (player)             | `player_club_name`       | Club name (for individual player registrations)     |
| Your club name (club rep)           | `club_name`              | Club name (for club representative registrations)   |
| Sport/Activity                      | `club_sport_type`        | Type of sport or activity                           |
| Approx number of players interested | `club_number_of_players` | Number of players (for club registrations)          |
| Additional Notes                    | `additional_notes`       | Optional additional information                     |

## Registration Types

### Parent/Guardian Registration

**Required Fields:**

- `reg_type=parent`
- `contact_email`

**Optional Fields:**

- `contact_first_name`, `contact_last_name`
- `contact_phone`
- `school_name`
- `school_no_of_children`
- `additional_notes`

### Individual Player Registration

**Required Fields:**

- `reg_type=player`
- `contact_email`

**Optional Fields:**

- `contact_first_name`, `contact_last_name`
- `contact_phone`
- `player_club_name`
- `club_sport_type`
- `additional_notes`

### Club Representative Registration

**Required Fields:**

- `reg_type=club`
- `contact_email`

**Optional Fields:**

- `contact_first_name`, `contact_last_name`
- `contact_phone`
- `club_name`
- `club_sport_type`
- `club_number_of_players`
- `additional_notes`

---

## Test URLs for Webhook Testing

### Parent/Guardian Tests

#### Test 1: Basic Parent Registration

```
https://yourbrainhealth.io/services/baseline-screening/register-your-interest/?reg_type=parent&contact_first_name=Sarah&contact_last_name=Johnson&contact_email=sarah.johnson@test.com&contact_phone=0412345678&school_name=Rostrevor%20College&school_no_of_children=2
```

**Response:**

```json
{
  "id": "430",
  "form_id": "3",
  "date_created": "2025-11-21 07:25:25",
  "status": "active",

  // Key form fields
  "17": "parent",                      // reg_type
  "6.3": "Sarah",                      // contact_first_name
  "6.6": "Johnson",                    // contact_last_name
  "3": "sarah.johnson@test.com",       // contact_email
  "18": "0412345678",                  // contact_phone
  "7": "Rostrevor College",            // school_name
  "16": "2",                           // school_no_of_children
  "27": "None noted",                  // additional_notes
  "14": "baseline-school-register-interest-form",

  // Metadata
  "source_url": "https://yourbrainhealth.io/services/baseline-screening/register-your-interest/?reg_type=parent&contact_first_name=Sarah&contact_last_name=Johnson&contact_email=sarah.johnson%40test.com&contact_phone=0",
  "ip": "45.249.118.244",
  "gravityformsrecaptcha_score": "0.9",

  // Empty fields (unused in this form submission)
  "28": "", "30": "", "31": "", "32": "", "19": "",
  "6.2": "", "6.4": "", "6.8": "",
  "20": "", "22": "", "23": "", "24": "", "25": "", "26": ""
}

#### Test 2: Parent with Additional Notes

```
https://yourbrainhealth.io/services/baseline-screening/register-your-interest/?reg_type=parent&contact_first_name=Michael&contact_last_name=Chen&contact_email=m.chen@test.com&contact_phone=0423456789&school_name=Adelaide%20High%20School&school_no_of_children=1&additional_notes=Previous%20concussion%20history
```

**Response:**
```json
{
  "id": "431",
  "form_id": "3",
  "date_created": "2025-11-21 07:27:32",
  "status": "active",

  // Key form fields
  "17": "parent",                      // reg_type
  "6.3": "Michael",                    // contact_first_name
  "6.6": "Chen",                       // contact_last_name
  "3": "m.chen@test.com",              // contact_email
  "18": "0423456789",                  // contact_phone
  "7": "Adelaide High School",         // school_name
  "16": "1",                           // school_no_of_children
  "27": "Previous concussion history", // additional_notes
  "14": "baseline-school-register-interest-form",

  // Metadata
  "source_url": "https://yourbrainhealth.io/services/baseline-screening/register-your-interest/?reg_type=parent&contact_first_name=Michael&contact_last_name=Chen&contact_email=m.chen%40test.com&contact_phone=042345678",
  "ip": "45.249.118.244",
  "gravityformsrecaptcha_score": "0.9",

  // Empty fields (unused in this form submission)
  "28": "", "30": "", "31": "", "32": "", "19": "",
  "6.2": "", "6.4": "", "6.8": "",
  "20": "", "22": "", "23": "", "24": "", "25": "", "26": ""
}


### Individual Player Tests

#### Test 1: Basic Player Registration

```
https://yourbrainhealth.io/services/baseline-screening/register-your-interest/?reg_type=player&contact_first_name=James&contact_last_name=Wilson&contact_email=james.wilson@test.com&contact_phone=0434567890&player_club_name=Port%20Adelaide%20FC
```

**Response:**
```json
{
  "id": "432",
  "form_id": "3",
  "date_created": "2025-11-21 07:28:46",
  "status": "active",

  // Key form fields
  "17": "player",                      // reg_type
  "6.3": "James",                      // contact_first_name
  "6.6": "Wilson",                     // contact_last_name
  "3": "james.wilson@test.com",        // contact_email
  "18": "0434567890",                  // contact_phone
  "22": "Port Adelaide FC",            // player_club_name
  "27": "None to note",                // additional_notes
  "14": "baseline-school-register-interest-form",

  // Metadata
  "source_url": "https://yourbrainhealth.io/services/baseline-screening/register-your-interest/?reg_type=player&contact_first_name=James&contact_last_name=Wilson&contact_email=james.wilson%40test.com&contact_phone=043",
  "ip": "45.249.118.244",
  "gravityformsrecaptcha_score": "0.9",

  // Empty fields (unused in this form submission)
  "28": "", "30": "", "31": "", "32": "", "19": "",
  "6.2": "", "6.4": "", "6.8": "",
  "20": "", "7": "", "16": "", "23": "", "24": "", "25": "", "26": ""
}

#### Test 2: Player with Different Notes

```
https://yourbrainhealth.io/services/baseline-screening/register-your-interest/?reg_type=player&contact_first_name=Emma&contact_last_name=Brown&contact_email=emma.brown@test.com&contact_phone=0445678901&player_club_name=North%20Adelaide%20Rockets
```

**Response:**
```json
{
  "id": "433",
  "form_id": "3",
  "date_created": "2025-11-21 07:30:05",
  "status": "active",

  // Key form fields
  "17": "player",                      // reg_type
  "6.3": "Emma",                       // contact_first_name
  "6.6": "Brown",                      // contact_last_name
  "3": "emma.brown@test.com",          // contact_email
  "18": "0445678901",                  // contact_phone
  "22": "North Adelaide Rockets",      // player_club_name
  "27": "This time no questions",      // additional_notes
  "14": "baseline-school-register-interest-form",

  // Metadata
  "source_url": "https://yourbrainhealth.io/services/baseline-screening/register-your-interest/?reg_type=player&contact_first_name=Emma&contact_last_name=Brown&contact_email=emma.brown%40test.com&contact_phone=0445678",
  "ip": "45.249.118.244",
  "gravityformsrecaptcha_score": "0.9",

  // Empty fields (unused in this form submission)
  "28": "", "30": "", "31": "", "32": "", "19": "",
  "6.2": "", "6.4": "", "6.8": "",
  "20": "", "7": "", "16": "", "23": "", "24": "", "25": "", "26": ""
}


### Club Representative Tests

#### Test 1: Basic Club Registration

```
https://yourbrainhealth.io/services/baseline-screening/register-your-interest/?reg_type=club&contact_first_name=David&contact_last_name=Thompson&contact_email=d.thompson@test.com&contact_phone=0456789012&club_name=Adelaide%20United%20FC&club_sport_type=Football&club_number_of_players=45
```

**Response:**
```json
{
  "id": "434",
  "form_id": "3",
  "date_created": "2025-11-21 07:30:54",
  "status": "active",

  // Key form fields
  "17": "club",                        // reg_type
  "6.3": "David",                      // contact_first_name
  "6.6": "Thompson",                   // contact_last_name
  "3": "d.thompson@test.com",          // contact_email
  "18": "0456789012",                  // contact_phone
  "24": "Adelaide United FC",          // club_name
  "25": "Football",                    // club_sport_type
  "26": "45",                          // club_number_of_players
  "27": "This is your friendly club",  // additional_notes
  "14": "baseline-school-register-interest-form",

  // Metadata
  "source_url": "https://yourbrainhealth.io/services/baseline-screening/register-your-interest/?reg_type=club&contact_first_name=David&contact_last_name=Thompson&contact_email=d.thompson%40test.com&contact_phone=04567",
  "ip": "45.249.118.244",
  "gravityformsrecaptcha_score": "0.9",

  // Empty fields (unused in this form submission)
  "28": "", "30": "", "31": "", "32": "", "19": "",
  "6.2": "", "6.4": "", "6.8": "",
  "20": "", "7": "", "16": "", "22": "", "23": ""
}

#### Test 2: Club with Additional Notes

```
https://yourbrainhealth.io/services/baseline-screening/register-your-interest/?reg_type=club&contact_first_name=Lisa&contact_last_name=Martinez&contact_email=lisa.m@test.com&contact_phone=0467890123&club_name=Sturt%20Cricket%20Club&club_sport_type=Cricket&club_number_of_players=80&additional_notes=U15%20and%20U17%20teams%20interested
```

**Response:**
```json
{
  "id": "435",
  "form_id": "3",
  "date_created": "2025-11-21 07:31:23",
  "status": "active",

  // Key form fields
  "17": "club",                          // reg_type
  "6.3": "Lisa",                         // contact_first_name
  "6.6": "Martinez",                     // contact_last_name
  "3": "lisa.m@test.com",                // contact_email
  "18": "0467890123",                    // contact_phone
  "24": "Sturt Cricket Club",            // club_name
  "25": "Cricket",                       // club_sport_type
  "26": "80",                            // club_number_of_players
  "27": "U15 and U17 teams interested",  // additional_notes
  "14": "baseline-school-register-interest-form",

  // Metadata
  "source_url": "https://yourbrainhealth.io/services/baseline-screening/register-your-interest/?reg_type=club&contact_first_name=Lisa&contact_last_name=Martinez&contact_email=lisa.m%40test.com&contact_phone=0467890123",
  "ip": "45.249.118.244",
  "gravityformsrecaptcha_score": "0.9",

  // Empty fields (unused in this form submission)
  "28": "", "30": "", "31": "", "32": "", "19": "",
  "6.2": "", "6.4": "", "6.8": "",
  "20": "", "7": "", "16": "", "22": "", "23": ""
}

---

## Complete Field ID Mapping Summary

Based on the webhook responses above, here are all the Gravity Forms field IDs:

| Field ID | Parameter Name           | Used In Registration Type(s) |
| -------- | ------------------------ | ---------------------------- |
| `"17"`   | `reg_type`               | All (parent/player/club)     |
| `"6.3"`  | `contact_first_name`     | All                          |
| `"6.6"`  | `contact_last_name`      | All                          |
| `"3"`    | `contact_email`          | All                          |
| `"18"`   | `contact_phone`          | All                          |
| `"7"`    | `school_name`            | Parent only                  |
| `"16"`   | `school_no_of_children`  | Parent only                  |
| `"22"`   | `player_club_name`       | Player only                  |
| `"24"`   | `club_name`              | Club only                    |
| `"25"`   | `club_sport_type`        | Club only                    |
| `"26"`   | `club_number_of_players` | Club only                    |
| `"27"`   | `additional_notes`       | All                          |
| `"14"`   | Form identifier          | All                          |

### Important Observations

1. **Field `"27"` (additional_notes)** has different default values:
   - Parent forms: "None noted"
   - Player forms: "None to note"
   - Club forms: Custom user input or default text

2. **Registration type determines which fields are populated:**
   - Parent: fields `"7"` and `"16"` are populated, fields `"22"`, `"24"`, `"25"`, `"26"` are empty
   - Player: field `"22"` is populated, fields `"7"`, `"16"`, `"24"`, `"25"`, `"26"` are empty
   - Club: fields `"24"`, `"25"`, `"26"` are populated, fields `"7"`, `"16"`, `"22"` are empty

3. **All submissions include:**
   - Metadata: `id`, `form_id`, `date_created`, `status`, `source_url`, `ip`, `gravityformsrecaptcha_score`
   - Form identifier: `"14": "baseline-school-register-interest-form"`

