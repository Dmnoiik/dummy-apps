<script lang="ts">
  import type { Doctor } from '../lib/data/doctors'
  import { formatDay } from '../lib/dates'
  import { validatePesel } from '../lib/pesel'
  import { validateEmail, validatePhone } from '../lib/validation'
  import { app, book, releaseHold, type Hold } from '../lib/state.svelte'

  let { hold, doctor }: { hold: Hold; doctor: Doctor } = $props()

  const previous = app.appointments.find((a) => a.id === app.reschedulingId)?.patient

  let fullName = $state(previous?.fullName ?? '')
  let pesel = $state(previous?.pesel ?? '')
  let phone = $state(previous?.phone ?? '')
  let email = $state(previous?.email ?? '')
  let reason = $state(previous?.reason ?? '')
  let submitted = $state(false)

  const peselResult = $derived(validatePesel(pesel.trim()))
  const birthDate = $derived(peselResult.birthDate ?? '')

  const errors = $derived({
    fullName: fullName.trim() ? '' : 'Enter your full name',
    pesel: peselResult.ok ? '' : 'Invalid PESEL',
    phone: validatePhone(phone) ? '' : 'Enter a valid phone number',
    email: validateEmail(email) ? '' : 'Enter a valid email address',
  })

  function submit(event: SubmitEvent) {
    event.preventDefault()
    submitted = true
    if (Object.values(errors).some(Boolean)) return
    book({
      fullName: fullName.trim(),
      pesel: pesel.trim(),
      birthDate,
      phone: phone.trim(),
      email: email.trim(),
      reason: reason.trim(),
    })
  }
</script>

<form onsubmit={submit} novalidate>
  <h2>Your details</h2>
  <p class="summary">{doctor.name} · {formatDay(hold.date)} · {hold.time}</p>

  <div class="field">
    <label for="full-name">Full name</label>
    <input id="full-name" type="text" autocomplete="name" bind:value={fullName} />
    {#if submitted && errors.fullName}<p class="error" role="alert">{errors.fullName}</p>{/if}
  </div>

  <div class="field">
    <label for="pesel">PESEL</label>
    <input id="pesel" type="text" inputmode="numeric" maxlength="11" bind:value={pesel} />
    {#if submitted && errors.pesel}<p class="error" role="alert">{errors.pesel}</p>{/if}
  </div>

  <div class="field">
    <label for="birth-date">Date of birth</label>
    <input id="birth-date" type="text" value={birthDate} placeholder="Filled in from your PESEL" readonly />
  </div>

  <div class="field">
    <label for="phone">Phone</label>
    <input id="phone" type="tel" placeholder="+48 600 123 456" autocomplete="tel" bind:value={phone} />
    {#if submitted && errors.phone}<p class="error" role="alert">{errors.phone}</p>{/if}
  </div>

  <div class="field">
    <label for="email">Email</label>
    <input id="email" type="email" autocomplete="email" bind:value={email} />
    {#if submitted && errors.email}<p class="error" role="alert">{errors.email}</p>{/if}
  </div>

  <div class="field">
    <label for="reason">Reason for visit</label>
    <textarea id="reason" rows="3" bind:value={reason}></textarea>
  </div>

  <div class="actions">
    <button type="submit" class="btn">Confirm booking</button>
    <button type="button" class="btn secondary" onclick={releaseHold}>Release slot</button>
  </div>
</form>

<style>
  form {
    display: grid;
    gap: 12px;
  }

  h2 {
    font-size: 1.05rem;
    margin-bottom: 0;
  }

  .summary {
    color: var(--muted);
    font-size: 0.9rem;
  }

  .field {
    display: grid;
    gap: 4px;
  }

  label {
    font-size: 0.85rem;
    font-weight: 600;
  }

  input,
  textarea {
    font: inherit;
    padding: 9px 11px;
    border: 1px solid #b9cfcc;
    border-radius: 9px;
    background: #fff;
    color: var(--ink);
    width: 100%;
  }

  input[readonly] {
    background: var(--sage);
  }

  .error {
    color: var(--danger);
    font-size: 0.82rem;
  }

  .actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 4px;
  }
</style>
