ABOVE & BEYOND THERAPY NOTE GENERATOR - VERSION 3
========================================================

WHAT THIS IS
------------
A no-install browser-based session note program built around the Above and Beyond Pediatric Therapy form.
The detailed checklist/input panel is used by the therapist but is hidden from the printed/exported note.

WHAT CHANGED IN THIS VERSION
----------------------------
- Added a "Co-treating with" field that appears when Co-treat is selected and is blended into the generated narrative.
- When "Understanding Prepositions" is selected, the therapist can identify the exact prepositions targeted (plus add custom ones).
- When "WH Questions" is selected, the therapist can identify the exact WH question types targeted (How, What, When, Where, Which, Who, Why, plus custom targets).
- Preposition and WH details flow naturally into the generated narrative and inherit the toy/material assigned to their parent skill.
- The printed section called "Additional Comments/What to work on this week" has been completely removed.
- All generated clinical information now flows into the printed NARRATIVE section.
- Each selected therapy skill can be paired with the specific toy/material/activity used during that target.
- A quick "Apply to All Selected Skills" tool is included when the same toy/material was used for several targets.
- The narrative generator now uses cleaner clinical wording and fixes awkward capitalization from checkbox labels.
- "Recreate Note" cycles through multiple professionally worded narrative versions while keeping the clinical facts the same.
- Therapist and parent can sign directly on the screen using a mouse, touchscreen, or stylus.
- Captured signatures are stored with the saved session and are included in the print preview and downloaded PDF.
- Word-compatible RTF export also includes captured signatures when possible.

HOW TO START
------------
Windows:
1. Double-click "Start Therapy Note Generator.bat"
OR
2. Double-click index.html

No programming is required.

BASIC WORKFLOW
--------------
1. Add or choose the child.
2. Enter the session information at the top.
3. Check the temperament, engagement, session setup, and therapy skills used.
4. Under "Toy / Material Used With Each Selected Skill," enter what was used for each selected target.
5. Add words heard or other clinician notes if needed.
6. Review the generated Narrative.
7. If you do not like the wording, click "Recreate Note" for another version. The clinical selections do not change.
8. Have the therapist sign the Therapist Signature box.
9. Hand the stylus/device to the parent to sign the Parent Signature box.
10. Save the session.
11. Print, download the signed PDF, or email/share the PDF.

WEEKLY CASELOAD / CHILD ROSTER
------------------------------
- Add each child once with the + button.
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
The program does not send data to a server. Information is stored locally in the browser unless you export, print, download, or share it.
Because therapy notes can contain protected health information, use the program only on an approved device and use your organization's approved secure email / record-handling process.

BACKUPS
-------
Browser storage can be cleared by browser cleanup, device replacement, IT policies, or profile changes.
Use "Export Backup" regularly, especially if the program is used for many children each week.
To restore, use "Import Backup."

FILES IN THIS FOLDER
--------------------
index.html      - Program launcher/page
styles.css      - Visual layout and print formatting
app.js          - Program logic, roster, note generation, toy pairing, signatures, PDF/RTF export
README.txt      - This guide
Start Therapy Note Generator.bat - Windows launcher
