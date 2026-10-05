ABOVE & BEYOND THERAPY NOTE GENERATOR - VERSION 4
========================================================

WHAT THIS IS
------------
A no-install browser-based session note program built around the Above and Beyond Pediatric Therapy form.
The detailed checklist/input panel is used by the therapist but is hidden from the printed/exported note.

WHAT CHANGED IN VERSION 4
-------------------------
- Added Child Gender next to the child's name. Gender is saved with the child profile and used by the note generator to choose appropriate he/him, she/her, or they/them pronouns. If gender/pronouns are not selected, the note safely uses "the child."
- Added a dedicated Self Concept section with checkboxes for Knows Age, Knows Gender, and Knows Name.
- Renamed Fine Motor Activities to Motor Activities.
- Expanded Motor Activities with Reaching, Supported Sitting, Supported Standing, and Tummy Time while retaining the existing motor targets.
- Added Visual Tracking under Receptive Communication & Cognitive Skills.
- Renamed Expressive Language to Language and added Auditory Response while retaining the existing language strategies.
- Upgraded Toy / Material Used With Each Selected Skill. After a toy/material is entered for a selected target, a second field appears asking how the child did: Succeeded, Needed Support, or Struggled.
- Activity performance is blended into the generated narrative rather than printed as checkboxes.
- Version 4.1 automatically migrates the child roster and saved sessions from Version 3 when it is opened at the same website/browser origin.

FEATURES RETAINED FROM VERSION 3
--------------------------------
- "Co-treating with" field appears when Co-treat is selected and flows into the narrative.
- Specific prepositions can be selected when Understanding Prepositions is targeted.
- Specific WH question types can be selected: How, What, When, Where, Which, Who, Why, plus custom targets.
- The old "Additional Comments/What to work on this week" section remains removed from the printed document.
- All generated clinical information flows into the printed Narrative section.
- Each selected therapy skill can be paired with its toy/material/activity.
- "Apply to All Selected Skills" can quickly apply one material to several selected targets.
- "Recreate Note" cycles through multiple professionally worded versions while keeping the selected clinical facts the same.
- Therapist and parent can sign directly on screen with mouse, touchscreen, or stylus.
- Signatures are saved with the session and included in the printed/downloaded PDF.
- PDF, print, Word-compatible RTF, and email/share workflows remain available.

HOW TO START
------------
Windows:
1. Double-click "Start Therapy Note Generator.bat"
OR
2. Double-click index.html

No programming is required.

BASIC WORKFLOW
--------------
1. Add or choose the child and select the child's gender/pronouns.
2. Enter the session information at the top.
3. Check the temperament, engagement, session setup, and therapy skills used.
4. Under "Toy / Material Used With Each Selected Skill," enter what was used for each selected target.
5. Once a material is entered, choose Succeeded, Needed Support, or Struggled if you want that performance reflected in the note.
6. Add words heard or other clinician notes if needed.
7. Review the generated Narrative.
8. If you do not like the wording, click "Recreate Note" for another version. The clinical selections do not change.
9. Have the therapist sign the Therapist Signature box.
10. Hand the stylus/device to the parent to sign the Parent Signature box.
11. Save the session.
12. Print, download the signed PDF, or email/share the PDF.

WEEKLY CASELOAD / CHILD ROSTER
------------------------------
- Add each child once with the + button.
- Gender/pronouns are stored with the child profile so they do not have to be selected every session.
- Click a child's name before starting a session.
- Click "New Session" for a clean note for that child.
- Click "Save Session" to keep the note in that browser.
- Saved sessions appear in Session History.
- Use Export Backup regularly to create a backup JSON file.

PRINTING AND EMAILING
---------------------
- "Print / Save as PDF" opens the browser print window.
- "Download PDF" creates a signed PDF file immediately.
- "Download Word (RTF)" creates a Word-compatible file.
- "Email / Share PDF" tries to share the signed PDF directly. If the browser/device cannot attach it automatically, the program downloads the PDF and opens an email window so it can be attached through the approved secure email system.

IMPORTANT PRIVACY NOTE
----------------------
The program does not send child/session data to a server. Information is stored locally in the browser unless you export, print, download, or share it.
Because therapy notes can contain protected health information, use the program only on an approved device and follow your organization's privacy, security, storage, printing, and email requirements.

BACKUPS
-------
Browser local storage can be cleared by site-data cleanup, device replacement, IT policies, browser profile changes, or moving to a different website address.
Use "Export Backup" regularly, especially if the program is used for many children each week.
To restore, use "Import Backup."

FILES IN THIS FOLDER
--------------------
index.html      - Program launcher/page
styles.css      - Visual layout and print formatting
app.js          - Program logic, roster, note generation, toy/performance pairing, signatures, PDF/RTF export
README.txt      - This guide
Start Therapy Note Generator.bat - Windows launcher


VERSION 4.1 CORRECTION
- Corrected the cognitive skill label from “Visual Tracker” to “Visual Tracking.”
- Existing saved sessions using the old label are automatically migrated, including toy/material and performance assignments.
