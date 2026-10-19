# Halves: user stories

Halves splits shared expenses within a group and shows who owes whom. All amounts are in PLN. Every story starts from the demo data: click "Reset demo data" and reload the page. The demo data has two groups: "Weekend in Zakopane" (Ania, Bartek, Celina) and "Flat 4B" (Ania, Bartek, Celina, Dawid).

## US-01: Get an overview of the groups

As a group member, I want to see my groups and their current standing so that I know where to start.

**Preconditions:** Demo data reset.

**Steps:**
1. Open the app and read the group cards on the "Your groups" page.
2. Click "Flat 4B".
3. Read the "Balances" panel next to the expense list.
4. Click "Back to groups", then click "Weekend in Zakopane" and read its "Balances" panel.

**Expected result:**
- Two groups are listed: "Weekend in Zakopane" with 3 people and 3 expenses, and "Flat 4B" with 4 people and 3 expenses.
- In "Flat 4B" the balances are Ania +60.00 PLN, Bartek +20.00 PLN, Celina -50.00 PLN and Dawid -30.00 PLN.
- In "Weekend in Zakopane" all three people show 0.00 PLN.
- "Flat 4B" lists "Internet - September", "Cleaning supplies" and "Groceries".

## US-02: Create a new group

As an organiser, I want to create a group for a trip so that we can start tracking costs.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "New group".
2. Enter "Ski trip" in "Group name".
3. Enter "Ola" in "Member name" and click "Add person".
4. Enter "Kuba" in "Member name" and click "Add person".
5. Click "Create group".
6. Click "Ski trip" in the list.

**Expected result:**
- The dialog closes and "Ski trip" appears among the groups with 2 people and 0 expenses.
- The group page shows Ola and Kuba as members.
- The "Balances" panel shows 0.00 PLN for both of them.
- The expense list says that there are no expenses yet.

## US-03: Split a dinner bill equally

As a group member, I want to split a shared expense equally so that everyone pays the same share.

**Preconditions:** Demo data reset. Group "Weekend in Zakopane" open.

**Steps:**
1. Click "Add expense".
2. Enter "Dinner" in "Description" and "100.00" in "Amount".
3. Select "Ania" in "Paid by".
4. Keep "Equally" in "Split method" and keep all three people ticked.
5. Click "Save".
6. Read the "Balances" panel.
7. Click the "Settle up" tab.

**Expected result:**
- The dialog closes and an "Expense added" message appears.
- "Dinner" is listed with 100.00 PLN and the date of today.
- The balances of the three people add up to 0.00 PLN.
- Ania is owed 66.67 PLN in total by the other two.
- The "Settle up" tab suggests transfers from Bartek and Celina to Ania that add up to 66.67 PLN.

## US-04: Split a bill by percentages

As a group member, I want to split an expense by percentages so that each person pays their agreed part.

**Preconditions:** Demo data reset. Group "Weekend in Zakopane" open.

**Steps:**
1. Click "Add expense".
2. Enter "Taxi" in "Description" and "90" in "Amount".
3. Select "Ania" in "Paid by".
4. Select "Percentages" in "Split method".
5. Enter 33.4 for "Ania", 33.3 for "Bartek" and 33.3 for "Celina".
6. Click "Save".

**Expected result:**
- The percentages add up to 100%, so the dialog closes and an "Expense added" message appears.
- "Taxi" is listed with 90.00 PLN.
- The split under the expense reads Ania 30.06 PLN, Bartek 29.97 PLN and Celina 29.97 PLN.
- The "Balances" panel shows Ania +59.94 PLN, Bartek -29.97 PLN and Celina -29.97 PLN.

## US-05: Split by exact amounts with a decimal comma

As a Polish user, I want to type amounts with a decimal comma so that I can enter prices the way they are written on the receipt.

**Preconditions:** Demo data reset. Group "Weekend in Zakopane" open.

**Steps:**
1. Click "Add expense".
2. Enter "Mountain hut" in "Description" and "30,50" in "Amount".
3. Select "Ania" in "Paid by".
4. Select "Exact amounts" in "Split method".
5. Enter "10,50" for "Ania", "10" for "Bartek" and "10" for "Celina".
6. Click "Save".

**Expected result:**
- The dialog closes and an "Expense added" message appears.
- "Mountain hut" is listed with 30.50 PLN.
- The split under the expense reads Ania 10.50 PLN, Bartek 10.00 PLN and Celina 10.00 PLN.
- The "Balances" panel shows Ania +20.00 PLN, Bartek -10.00 PLN and Celina -10.00 PLN.

## US-06: Correct the amount of an expense

As a group member, I want to fix an amount I entered wrongly so that everyone sees the right balances.

**Preconditions:** Demo data reset. Group "Weekend in Zakopane" open.

**Steps:**
1. Click "Add expense", enter "Dinner" and "100.00", select "Ania" in "Paid by" and click "Save".
2. Click "Edit Dinner".
3. Change "Amount" to "120" and click "Save".
4. Read the expense list and the "Balances" panel.
5. Click "Back to groups" and open "Weekend in Zakopane" again.

**Expected result:**
- An "Expense updated" message appears and the dialog closes.
- "Dinner" is listed with 120.00 PLN.
- The balances are Ania +80.00 PLN, Bartek -40.00 PLN and Celina -40.00 PLN.
- Reopening the group shows the same list and the same balances.

## US-07: Add expenses in two groups one after another

As a member of two groups, I want to record costs in each of them so that both stay up to date.

**Preconditions:** Demo data reset.

**Steps:**
1. Open "Weekend in Zakopane", click "Add expense", enter "Snacks" and "30", select "Ania" in "Paid by", and click "Save".
2. Click "Back to groups" and open "Flat 4B".
3. Click "Back to groups" and open "Weekend in Zakopane" again.
4. Click "Add expense", enter "Tea" and "30", select "Ania" in "Paid by", and click "Save".

**Expected result:**
- Each save closes the dialog and shows an "Expense added" message.
- "Weekend in Zakopane" lists "Snacks" with 30.00 PLN and "Tea" with 30.00 PLN, next to its three original expenses.
- "Flat 4B" is unchanged and still lists its three expenses.
- The "Balances" panel of "Weekend in Zakopane" shows Ania +40.00 PLN, Bartek -20.00 PLN and Celina -20.00 PLN.

## US-08: Settle the flat

As a flatmate, I want to see which transfers settle all debts so that we can square up in as few payments as possible.

**Preconditions:** Demo data reset. Group "Flat 4B" open.

**Steps:**
1. Read the "Balances" panel.
2. Click the "Settle up" tab.
3. Read the suggested transfers.
4. Imagine that every suggested transfer is made, and compare it with the balances from step 1.

**Expected result:**
- The balances are Ania +60.00 PLN, Bartek +20.00 PLN, Celina -50.00 PLN and Dawid -30.00 PLN.
- The suggested transfers are "Celina pays Ania 50.00 PLN", "Dawid pays Ania 10.00 PLN" and "Dawid pays Bartek 20.00 PLN".
- After these transfers, Ania has received 60.00 PLN and Bartek 20.00 PLN, so everyone is settled up.

## US-09: Remove a person who left the flat

As a flatmate, I want to remove someone who moved out so that they no longer appear in the group, but only when nothing is left to settle with them.

**Preconditions:** Demo data reset. Group "Flat 4B" open.

**Steps:**
1. Read the "Balances" panel.
2. Click "Remove Celina".
3. Read the message and the "Balances" panel again.
4. Click "Remove Ania".

**Expected result:**
- Celina has an open balance of -50.00 PLN, so she is not removed. The message "Cannot remove a member with an outstanding balance" appears and she stays in the members list and in the "Balances" panel.
- Ania has an open balance too, so she is not removed either.
- The balances of the four people are unchanged and still add up to 0.00 PLN.

## US-10: Review the expense history

As a group member, I want to see the expenses newest first so that I can find the latest costs quickly.

**Preconditions:** Demo data reset.

**Steps:**
1. Open "Weekend in Zakopane".
2. Read the expense list from top to bottom, including the date of each expense.

**Expected result:**
- The list shows "Cable car tickets" (12.10.2026), "Groceries" (05.10.2026) and "Cabin deposit" (28.09.2026), in that order.
- Each expense shows its amount, category, who paid and how it is split.

## US-11: Add an expense from a phone

As a group member on the go, I want to add an expense on my phone right after paying so that I do not forget it.

**Preconditions:** Demo data reset. Browser window 360 px wide and 640 px high.

**Steps:**
1. Open "Weekend in Zakopane".
2. Click "Add expense".
3. Enter "Taxi" in "Description" and "45" in "Amount".
4. Scroll down inside the dialog and click "Save".

**Expected result:**
- The whole form fits the narrow screen with one field per row.
- After "Save" the dialog closes and an "Expense added" message appears.
- "Taxi" is listed with 45.00 PLN, and the "Balances" panel below the list is updated.

## US-12: Record a refund

As a group member, I want to record that I got money back for a cost so that the group balances stay correct.

**Preconditions:** Demo data reset. Group "Weekend in Zakopane" open.

**Steps:**
1. Click "Add expense".
2. Enter "Cabin refund" in "Description" and "-50" in "Amount".
3. Select "Ania" in "Paid by" and keep "Equally".
4. Click "Save".

**Expected result:**
- The expense is not saved, because an amount has to be greater than zero.
- The dialog stays open with a message next to "Amount" asking for a valid amount.
- The expense list still shows the three original expenses and the balances are unchanged at 0.00 PLN for everyone.

## US-13: Split a cost by shares

As a group member, I want to split a cost by shares so that people who use more pay proportionally more.

**Preconditions:** Demo data reset. Group "Weekend in Zakopane" open.

**Steps:**
1. Click "Add expense".
2. Enter "Skipass" in "Description" and "100" in "Amount".
3. Select "Celina" in "Paid by".
4. Select "Shares" in "Split method".
5. Enter 1 for "Ania", 1 for "Bartek" and 2 for "Celina".
6. Click "Save".

**Expected result:**
- The dialog closes and an "Expense added" message appears.
- "Skipass" is listed with 100.00 PLN.
- The split under the expense reads Ania 25.00 PLN, Bartek 25.00 PLN and Celina 50.00 PLN.
- The "Balances" panel shows Celina +50.00 PLN, Ania -25.00 PLN and Bartek -25.00 PLN.

## US-14: Start over with the demo data

As a tester, I want to restore the demo data so that I can repeat a scenario from the same state.

**Preconditions:** Demo data reset.

**Steps:**
1. Open "Weekend in Zakopane", click "Add expense", enter "Snacks" and "30", and click "Save".
2. Click "Back to groups".
3. Click "Reset demo data".
4. Open "Weekend in Zakopane".

**Expected result:**
- After the reset the "Your groups" page is shown with "Weekend in Zakopane" and "Flat 4B".
- "Weekend in Zakopane" lists only "Cable car tickets", "Groceries" and "Cabin deposit"; "Snacks" is gone.
- All balances in the group are 0.00 PLN.
