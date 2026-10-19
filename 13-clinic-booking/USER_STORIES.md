# Medora Clinic: user stories

Medora Clinic lets patients pick a specialty and a doctor, choose a day and a 30-minute time, and book a visit. Every story starts from the demo data: click "Reset demo data" (the page reloads). The demo data contains one visit in "My appointments": Dr. Anna Nowak (Cardiology), tomorrow at 08:00, for Jan Kowalski. Doctors work Monday to Friday: Dr. Anna Nowak (Cardiology) 08:00-16:00, Dr. Piotr Wiśniewski (Dermatology) 09:00-15:00, Dr. Ewa Lis (Dermatology) 10:00-18:00, Dr. Marek Zając (Pediatrics) 08:00-14:00. Each doctor has a lunch break from 12:00 to 12:30. Where a story says "Thursday next week", pick any weekday of that kind in the calendar that is still in the future.

## US-01: Browse doctors by specialty

As a patient, I want to see which doctors work in each specialty so that I can decide whom to book.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Dermatology" under "Choose a specialty".
2. Read the doctor cards under "Choose a doctor".
3. Click "Pediatrics" and read the doctor cards.
4. Click "Cardiology" and read the doctor cards.

**Expected result:**
- "Dermatology" lists Dr. Piotr Wiśniewski (Mon-Fri 09:00-15:00) and Dr. Ewa Lis (Mon-Fri 10:00-18:00), each with a "Choose" button carrying the doctor's name.
- "Pediatrics" lists Dr. Marek Zając (Mon-Fri 08:00-14:00).
- "Cardiology" lists Dr. Anna Nowak (Mon-Fri 08:00-16:00).
- The selected specialty is highlighted.

## US-02: Book a morning check-up

As a patient, I want to book a check-up with a cardiologist so that my visit is on the calendar.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Cardiology", then click "Choose Dr. Anna Nowak".
2. In the calendar, click the number of a Thursday next week.
3. Click the "10:00" time.
4. Enter "Maria Zielińska" as "Full name", "85031501234" as "PESEL", "600123456" as "Phone", "maria.zielinska@example.com" as "Email" and "Routine check-up" as "Reason for visit".
5. Click "Confirm booking".
6. Click "Close" in the confirmation.
7. Read "My appointments" and look at the "10:00" time in the list of times.
8. Click the "10:00" time again.

**Expected result:**
- After step 4 the "Date of birth" field shows 1985-03-15.
- A confirmation names Dr. Anna Nowak, the chosen Thursday at 10:00 and Maria Zielińska.
- "My appointments" lists the new visit with the date of the Thursday you chose, followed by ", 10:00", next to the demo visit.
- The "10:00" time is shown as booked and cannot be selected again; no booking form opens.

## US-03: Book an afternoon visit

As a patient, I want to book the latest possible appointment of the day so that I can come after work.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Cardiology", then click "Choose Dr. Anna Nowak".
2. In the calendar, click the number of a Wednesday next week.
3. Scroll to the end of the list of times and click the last one.
4. Enter "Maria Zielińska" as "Full name", "85031501234" as "PESEL", "600123456" as "Phone" and "maria.zielinska@example.com" as "Email".
5. Click "Confirm booking".

**Expected result:**
- Times are offered every 30 minutes from the doctor's start of work, and every visit ends before the doctor's working day ends at 16:00.
- The visit is confirmed for the last time in the list.
- "My appointments" shows the visit for the chosen Wednesday.

## US-04: Book a visit around noon

As a patient, I want to book a visit around midday so that I can fit it into my lunch hour.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Cardiology", then click "Choose Dr. Anna Nowak".
2. In the calendar, click the number of a Tuesday next week.
3. Read the times between 11:00 and 13:30.
4. Click "11:30".
5. Enter "Maria Zielińska" as "Full name", "85031501234" as "PESEL", "600123456" as "Phone" and "maria.zielinska@example.com" as "Email".
6. Click "Confirm booking".

**Expected result:**
- Times follow each other every 30 minutes and respect the doctor's lunch break from 12:00 to 12:30.
- The visit at 11:30 is confirmed and listed in "My appointments".

## US-05: Look at the calendar for the following month

As a patient, I want to plan a visit well ahead so that I can pick a date after the holidays.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Cardiology", then click "Choose Dr. Anna Nowak".
2. Click "Next month" until the calendar heading shows January of next year.
3. Click "31".
4. Click "Next month".
5. Click "Previous month".

**Expected result:**
- After step 2 the heading reads "January" followed by next year, and "31" is the last day of the grid.
- After step 4 the heading shows February of next year with its days from 1 to 28 (or 29 in a leap year).
- After step 5 the calendar is back on January of next year.

## US-06: Cancel a visit I cannot attend

As a patient, I want to cancel the visit I booked for tomorrow morning because something came up.

**Preconditions:** Demo data reset, done in the evening (any time after 08:00 on the current day).

**Steps:**
1. Find the visit of Dr. Anna Nowak in "My appointments".
2. Click "Cancel appointment" on that visit.

**Expected result:**
- The clinic only lets patients cancel visits that start more than 24 hours from now. Because the visit is tomorrow at 08:00, the message "Appointments can only be cancelled more than 24 hours in advance" appears under the visit.
- The visit stays in "My appointments", next to its "Reschedule" button.

## US-07: Move my visit to another day

As a patient, I want to move my visit to a later day so that it fits my schedule.

**Preconditions:** Demo data reset.

**Steps:**
1. In "My appointments", click "Reschedule" on the visit.
2. Read the notice above "Choose a specialty".
3. In the calendar, click the number of a Thursday next week.
4. Click "11:00".
5. Check the details in the booking form and click "Confirm booking".
6. Click "Close" in the confirmation.

**Expected result:**
- A notice says "Pick a new time for your appointment." and Dr. Anna Nowak is already selected.
- The booking form is filled in with Jan Kowalski's details.
- The confirmation says "Appointment rescheduled".
- "My appointments" still lists a single visit, now on the Thursday you chose at 11:00, and the old time is gone.

## US-08: Book a first visit as a student

As a university student, I want to book my first visit at the clinic so that I can get a check-up.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Pediatrics", then click "Choose Dr. Marek Zając".
2. In the calendar, click the number of a Monday next week.
3. Click "09:00".
4. Enter "Zofia Maj" as "Full name", "03231001239" as "PESEL" (your PESEL), "600123456" as "Phone" and "zofia.maj@example.com" as "Email".
5. Click "Confirm booking".
6. Click "Close" in the confirmation.

**Expected result:**
- The form accepts the details, and the "Date of birth" field shows 2003-03-10.
- The confirmation names Dr. Marek Zając, the chosen Monday at 09:00 and Zofia Maj.
- "My appointments" lists the new visit at 09:00.

## US-09: Leave contact details for reminders

As a patient, I want to give my phone number and e-mail so that the clinic can remind me about the visit.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Dermatology", then click "Choose Dr. Ewa Lis".
2. In the calendar, click the number of a Friday next week.
3. Click "14:00".
4. Enter "Piotr Lewandowski" as "Full name", "85031501234" as "PESEL", "+48 600 123 456" as "Phone" and "piotr.lewandowski@example.com" as "Email".
5. Click "Confirm booking".
6. Click "Close" in the confirmation.

**Expected result:**
- The form accepts the phone number and e-mail.
- The confirmation says it was sent to piotr.lewandowski@example.com.
- "My appointments" lists the new visit at 14:00 with Dr. Ewa Lis.

## US-10: Compare times of two dermatologists

As a patient, I want to look at the available times of both dermatologists before I choose, so that I get the slot that suits me.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Dermatology", then click "Choose Dr. Piotr Wiśniewski".
2. In the calendar, click the number of a Wednesday next week.
3. Click "10:00".
4. Click "Choose Dr. Ewa Lis" and click "10:30".
5. Click "Choose Dr. Piotr Wiśniewski" and click "11:00".
6. Click "Choose Dr. Ewa Lis" and click "11:30".
7. Wait about 10 seconds and read the "Held for" timer above the booking form.

**Expected result:**
- Each click on a time reserves it for you and the booking form shows which doctor and time are held.
- A newly held time starts a 5-minute countdown, shown as "Held for 05:00" and counting down one second at a time.
- After about 10 seconds the timer reads about "Held for 04:50".

## US-11: Book an appointment using only the keyboard

As a patient who cannot use a mouse, I want to book a visit with the keyboard alone so that I can use the clinic's site independently.

**Preconditions:** Demo data reset. Use only Tab, Shift+Tab, Enter and Space from here on.

**Steps:**
1. Tab to "Cardiology" and press Enter.
2. Tab to "Choose Dr. Anna Nowak" and press Enter.
3. Tab through the calendar to the number of a weekday next week and press Enter.
4. Tab to a free time in the list of times and press Enter.
5. Tab through the form, entering "Maria Zielińska" as "Full name", "85031501234" as "PESEL", "600123456" as "Phone" and "maria.zielinska@example.com" as "Email".
6. Tab to "Confirm booking" and press Enter.
7. Tab to "Close" in the confirmation and press Enter.

**Expected result:**
- Every control, including the times, receives a visible focus in a logical order.
- Free and booked times can be told apart without relying on colour alone.
- The visit is confirmed and listed in "My appointments".

## US-12: Check that weekends are closed

As a patient, I want to see that the clinic does not work on weekends so that I do not plan a visit for then.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Cardiology", then click "Choose Dr. Anna Nowak".
2. In the calendar, click the number of a Saturday next week.
3. Click the number of the following Monday.

**Expected result:**
- For the Saturday the page says "No appointments available on this day" and no times are listed.
- For the Monday the list of times is shown again, starting at 08:00.

## US-13: Keep my visits after a reload and start over with a reset

As a patient, I want my booking to survive a page reload, and as a demo user I want to get back to the starting point.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Cardiology", click "Choose Dr. Anna Nowak" and click the number of a Wednesday next week.
2. Click "15:00".
3. Enter "Maria Zielińska" as "Full name", "85031501234" as "PESEL", "600123456" as "Phone" and "maria.zielinska@example.com" as "Email", then click "Confirm booking" and click "Close".
4. Reload the page and read "My appointments".
5. Click "Reset demo data" and read "My appointments".

**Expected result:**
- After the reload "My appointments" still lists both the demo visit and the new visit at 15:00.
- After the reset only the demo visit with Dr. Anna Nowak, tomorrow at 08:00, remains.

## US-14: Fill in the booking form incompletely

As a patient, I want to be told what is missing in the booking form so that I can correct it.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Dermatology", click "Choose Dr. Piotr Wiśniewski" and click the number of a Tuesday next week.
2. Click "09:30".
3. Click "Confirm booking" without filling in anything.
4. Enter "Piotr" as "Full name", "12345" as "PESEL" and "abc" as "Email".
5. Click "Confirm booking".
6. Click "Release slot".

**Expected result:**
- After step 3 the form reports "Enter your full name", "Invalid PESEL", "Enter a valid phone number" and "Enter a valid email address", and no visit is created.
- After step 5 the messages for the phone number, PESEL and email remain and no confirmation appears.
- After step 6 the booking form and the "Held for" timer disappear and "My appointments" is unchanged.
