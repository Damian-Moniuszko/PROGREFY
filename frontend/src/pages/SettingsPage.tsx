import { type FormEvent, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './SettingsPage.css'

type Gender = '' | 'MALE' | 'FEMALE' | 'OTHER'

type Country = {
  code: string
  name: string
  dialCode: string
  flag: string
  minDigits: number
  maxDigits: number
}

const COUNTRIES: Country[] = [
  { code: 'PL', name: 'Polska', dialCode: '+48', flag: '🇵🇱', minDigits: 9, maxDigits: 9 },
  { code: 'DE', name: 'Niemcy', dialCode: '+49', flag: '🇩🇪', minDigits: 10, maxDigits: 11 },
  { code: 'GB', name: 'Wielka Brytania', dialCode: '+44', flag: '🇬🇧', minDigits: 9, maxDigits: 10 },
  { code: 'US', name: 'Stany Zjednoczone', dialCode: '+1', flag: '🇺🇸', minDigits: 10, maxDigits: 10 },
  { code: 'CA', name: 'Kanada', dialCode: '+1', flag: '🇨🇦', minDigits: 10, maxDigits: 10 },
  { code: 'FR', name: 'Francja', dialCode: '+33', flag: '🇫🇷', minDigits: 9, maxDigits: 9 },
  { code: 'ES', name: 'Hiszpania', dialCode: '+34', flag: '🇪🇸', minDigits: 9, maxDigits: 9 },
  { code: 'IT', name: 'Włochy', dialCode: '+39', flag: '🇮🇹', minDigits: 9, maxDigits: 10 },
  { code: 'NL', name: 'Holandia', dialCode: '+31', flag: '🇳🇱', minDigits: 9, maxDigits: 9 },
  { code: 'BE', name: 'Belgia', dialCode: '+32', flag: '🇧🇪', minDigits: 9, maxDigits: 9 },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹', minDigits: 10, maxDigits: 11 },
  { code: 'CH', name: 'Szwajcaria', dialCode: '+41', flag: '🇨🇭', minDigits: 9, maxDigits: 9 },
  { code: 'SE', name: 'Szwecja', dialCode: '+46', flag: '🇸🇪', minDigits: 9, maxDigits: 9 },
  { code: 'NO', name: 'Norwegia', dialCode: '+47', flag: '🇳🇴', minDigits: 8, maxDigits: 8 },
  { code: 'DK', name: 'Dania', dialCode: '+45', flag: '🇩🇰', minDigits: 8, maxDigits: 8 },
  { code: 'FI', name: 'Finlandia', dialCode: '+358', flag: '🇫🇮', minDigits: 9, maxDigits: 10 },
  { code: 'IE', name: 'Irlandia', dialCode: '+353', flag: '🇮🇪', minDigits: 9, maxDigits: 9 },
  { code: 'CZ', name: 'Czechy', dialCode: '+420', flag: '🇨🇿', minDigits: 9, maxDigits: 9 },
  { code: 'SK', name: 'Słowacja', dialCode: '+421', flag: '🇸🇰', minDigits: 9, maxDigits: 9 },
  { code: 'UA', name: 'Ukraina', dialCode: '+380', flag: '🇺🇦', minDigits: 9, maxDigits: 9 },
  { code: 'LT', name: 'Litwa', dialCode: '+370', flag: '🇱🇹', minDigits: 8, maxDigits: 8 },
  { code: 'LV', name: 'Łotwa', dialCode: '+371', flag: '🇱🇻', minDigits: 8, maxDigits: 8 },
  { code: 'EE', name: 'Estonia', dialCode: '+372', flag: '🇪🇪', minDigits: 7, maxDigits: 8 },
  { code: 'RO', name: 'Rumunia', dialCode: '+40', flag: '🇷🇴', minDigits: 9, maxDigits: 9 },
  { code: 'HU', name: 'Węgry', dialCode: '+36', flag: '🇭🇺', minDigits: 9, maxDigits: 9 },
  { code: 'PT', name: 'Portugalia', dialCode: '+351', flag: '🇵🇹', minDigits: 9, maxDigits: 9 },
  { code: 'GR', name: 'Grecja', dialCode: '+30', flag: '🇬🇷', minDigits: 10, maxDigits: 10 },
  { code: 'TR', name: 'Turcja', dialCode: '+90', flag: '🇹🇷', minDigits: 10, maxDigits: 10 },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', minDigits: 9, maxDigits: 9 },
  { code: 'NZ', name: 'Nowa Zelandia', dialCode: '+64', flag: '🇳🇿', minDigits: 8, maxDigits: 10 },
  { code: 'JP', name: 'Japonia', dialCode: '+81', flag: '🇯🇵', minDigits: 9, maxDigits: 10 },
  { code: 'KR', name: 'Korea Południowa', dialCode: '+82', flag: '🇰🇷', minDigits: 9, maxDigits: 10 },
  { code: 'IN', name: 'Indie', dialCode: '+91', flag: '🇮🇳', minDigits: 10, maxDigits: 10 },
  { code: 'BR', name: 'Brazylia', dialCode: '+55', flag: '🇧🇷', minDigits: 10, maxDigits: 11 },
]

function normalizePhoneDigits(value: string) {
  return value.replace(/\D/g, '')
}

function parseStoredPhone(value: string | null | undefined) {
  if (!value) {
    return { country: COUNTRIES[0], local: '' }
  }

  const normalized = value.trim()

  const country = [...COUNTRIES]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((item) => normalized.startsWith(item.dialCode))

  if (!country) {
    return {
      country: COUNTRIES[0],
      local: normalizePhoneDigits(normalized).replace(/^48/, ''),
    }
  }

  const afterPrefix = normalized.slice(country.dialCode.length)
  return {
    country,
    local: normalizePhoneDigits(afterPrefix),
  }
}

function formatLocalPhone(value: string) {
  return normalizePhoneDigits(value).slice(0, 15)
}

type FieldErrors = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  birthDate?: string
  gender?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

const API_URL = 'http://localhost:3000'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value)
}

function isValidPhone(value: string, country: Country) {
  if (!value.trim()) return true
  const digits = normalizePhoneDigits(value)
  return (
    digits.length >= country.minDigits &&
    digits.length <= country.maxDigits
  )
}

function passwordRules(value: string) {
  return {
    length: value.length >= 8,
    uppercase: /[A-ZĄĆĘŁŃÓŚŹŻ]/.test(value),
    lowercase: /[a-ząćęłńóśźż]/.test(value),
    number: /\d/.test(value),
  }
}

function formatDate(value: string) {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  return `${day}.${month}.${year}`
}

function toInputDate(value: string | null | undefined) {
  if (!value) return ''
  return value.slice(0, 10)
}

function SettingsPage() {
  const { user, token, login } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [initialPhone] = useState(() => parseStoredPhone(user?.phone))
  const [phoneCountry, setPhoneCountry] = useState<Country>(
    initialPhone.country,
  )
  const [phone, setPhone] = useState(initialPhone.local)
  const [countrySearch, setCountrySearch] = useState('')
  const [countryPickerOpen, setCountryPickerOpen] = useState(false)
  const [birthDate, setBirthDate] = useState(toInputDate(user?.birthDate))
  const [gender, setGender] = useState<Gender>(
    (user?.gender as Gender) || '',
  )

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [errors, setErrors] = useState<FieldErrors>({})
  const [accountMessage, setAccountMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [accountLoading, setAccountLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatarUrl ?? null,
  )
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [calendarMode, setCalendarMode] = useState<'days' | 'months' | 'years'>('days')
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const value = birthDate ? new Date(`${birthDate}T12:00:00`) : new Date()
    return new Date(value.getFullYear(), value.getMonth(), 1)
  })

  const passwordState = useMemo(
    () => passwordRules(newPassword),
    [newPassword],
  )

  const hasPasswordErrors =
    !passwordState.length ||
    !passwordState.uppercase ||
    !passwordState.lowercase ||
    !passwordState.number ||
    newPassword !== confirmPassword

  if (!user) return null

  function validateAccount(): FieldErrors {
    const next: FieldErrors = {}

    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()
    const cleanEmail = email.trim()

    if (cleanFirstName.length < 2) {
      next.firstName = 'Imię musi mieć co najmniej 2 znaki.'
    } else if (cleanFirstName.length > 40) {
      next.firstName = 'Imię może mieć maksymalnie 40 znaków.'
    } else if (!/^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż -]+$/.test(cleanFirstName)) {
      next.firstName = 'Imię może zawierać tylko litery, spacje i myślnik.'
    }

    if (cleanLastName.length < 2) {
      next.lastName = 'Nazwisko musi mieć co najmniej 2 znaki.'
    } else if (cleanLastName.length > 60) {
      next.lastName = 'Nazwisko może mieć maksymalnie 60 znaków.'
    } else if (!/^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż -]+$/.test(cleanLastName)) {
      next.lastName =
        'Nazwisko może zawierać tylko litery, spacje i myślnik.'
    }

    if (!isValidEmail(cleanEmail)) {
      next.email = 'Podaj poprawny adres e-mail.'
    }

    if (!isValidPhone(phone, phoneCountry)) {
      next.phone = `Numer dla ${phoneCountry.name} powinien mieć od ${phoneCountry.minDigits} do ${phoneCountry.maxDigits} cyfr.`
    }

    if (birthDate) {
      const date = new Date(`${birthDate}T12:00:00`)
      const today = new Date()
      const minimum = new Date(
        today.getFullYear() - 120,
        today.getMonth(),
        today.getDate(),
      )

      if (
        Number.isNaN(date.getTime()) ||
        date > today ||
        date < minimum
      ) {
        next.birthDate = 'Podaj poprawną datę urodzenia.'
      }
    }

    if (gender && !['MALE', 'FEMALE', 'OTHER'].includes(gender)) {
      next.gender = 'Wybierz poprawną opcję.'
    }

    return next
  }

  async function saveAccount(event: FormEvent) {
    event.preventDefault()

    if (!token) return

    const nextErrors = validateAccount()
    setErrors(nextErrors)
    setAccountMessage('')

    if (Object.keys(nextErrors).length > 0) return

    try {
      setAccountLoading(true)

      const response = await fetch(`${API_URL}/api/me/account`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim()
            ? `${phoneCountry.dialCode}${normalizePhoneDigits(phone)}`
            : null,
          birthDate: birthDate || null,
          gender: gender || null,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setAccountMessage(
          data?.message || 'Nie udało się zapisać zmian.',
        )
        return
      }

      await login(token)
      setAccountMessage('Dane zostały zapisane.')
    } catch {
      setAccountMessage('Nie udało się połączyć z serwerem.')
    } finally {
      setAccountLoading(false)
    }
  }

  function validatePassword(): FieldErrors {
    const next: FieldErrors = {}

    if (!currentPassword) {
      next.currentPassword = 'Podaj aktualne hasło.'
    }

    if (!passwordState.length) {
      next.newPassword = 'Hasło musi mieć co najmniej 8 znaków.'
    } else if (
      !passwordState.uppercase ||
      !passwordState.lowercase ||
      !passwordState.number
    ) {
      next.newPassword =
        'Hasło musi zawierać wielką literę, małą literę i cyfrę.'
    }

    if (!confirmPassword) {
      next.confirmPassword = 'Potwierdź nowe hasło.'
    } else if (newPassword !== confirmPassword) {
      next.confirmPassword = 'Hasła nie są identyczne.'
    }

    return next
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault()

    if (!token) return

    const nextErrors = validatePassword()
    setErrors((current) => ({
      ...current,
      currentPassword: nextErrors.currentPassword,
      newPassword: nextErrors.newPassword,
      confirmPassword: nextErrors.confirmPassword,
    }))
    setPasswordMessage('')

    if (
      nextErrors.currentPassword ||
      nextErrors.newPassword ||
      nextErrors.confirmPassword
    ) {
      return
    }

    try {
      setPasswordLoading(true)

      const response = await fetch(`${API_URL}/api/me/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setPasswordMessage(
          data?.message || 'Nie udało się zmienić hasła.',
        )
        return
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setErrors((current) => ({
        ...current,
        currentPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined,
      }))
      setPasswordMessage('Hasło zostało zmienione.')
    } catch {
      setPasswordMessage('Nie udało się połączyć z serwerem.')
    } finally {
      setPasswordLoading(false)
    }
  }

  async function compressAvatar(file: File) {
    const maxInputSize = 20 * 1024 * 1024
    const maxDimension = 1200
    const targetBytes = 900 * 1024

    if (file.size > maxInputSize) {
      throw new Error('Zdjęcie może mieć maksymalnie 20 MB.')
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Dozwolone są pliki JPG, PNG lub WebP.')
    }

    const bitmap = await createImageBitmap(file)

    const scale = Math.min(
      1,
      maxDimension / Math.max(bitmap.width, bitmap.height),
    )

    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))

    const context = canvas.getContext('2d')

    if (!context) {
      bitmap.close()
      throw new Error('Nie udało się przygotować zdjęcia.')
    }

    context.drawImage(
      bitmap,
      0,
      0,
      canvas.width,
      canvas.height,
    )

    bitmap.close()

    let quality = 0.86
    let dataUrl = canvas.toDataURL('image/jpeg', quality)

    while (
      dataUrl.length * 0.75 > targetBytes &&
      quality > 0.45
    ) {
      quality -= 0.07
      dataUrl = canvas.toDataURL('image/jpeg', quality)
    }

    return dataUrl
  }

  async function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file || !token) return

    setAvatarError('')

    try {
      setAvatarLoading(true)

      const compressedImage = await compressAvatar(file)

      const response = await fetch(`${API_URL}/api/me/account`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          avatarUrl: compressedImage,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setAvatarError(
          data?.message || 'Nie udało się zapisać zdjęcia.',
        )
        return
      }

      setAvatarPreview(compressedImage)
      await login(token)
    } catch (error) {
      setAvatarError(
        error instanceof Error
          ? error.message
          : 'Nie udało się przetworzyć zdjęcia.',
      )
    } finally {
      setAvatarLoading(false)
    }
  }

  function daysForMonth(month: Date) {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    const first = new Date(year, monthIndex, 1)
    const last = new Date(year, monthIndex + 1, 0)
    const firstDay = (first.getDay() + 6) % 7
    const days: Array<Date | null> = []

    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let day = 1; day <= last.getDate(); day++) {
      days.push(new Date(year, monthIndex, day))
    }

    return days
  }

  function selectDate(date: Date) {
    const value = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-')

    setBirthDate(value)
    setDatePickerOpen(false)
    setErrors((current) => ({
      ...current,
      birthDate: undefined,
    }))
  }

  function selectCalendarYear(year: number) {
    setCalendarMonth(
      (current) => new Date(year, current.getMonth(), 1),
    )
    setCalendarMode('months')
  }

  function selectCalendarMonth(month: number) {
    setCalendarMonth(
      (current) => new Date(current.getFullYear(), month, 1),
    )
    setCalendarMode('days')
  }

  function moveMonth(offset: number) {
    setCalendarMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + offset,
          1,
        ),
    )
  }

  const monthLabel = new Intl.DateTimeFormat('pl-PL', {
    month: 'long',
    year: 'numeric',
  }).format(calendarMonth)

  const avatarLetters = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`

  return (
    <main className="settings-page">
      <div className="settings-page__container">
        <Link to="/profile" className="settings-back">
          ← Profil
        </Link>

        <header className="settings-hero">
          <div className="settings-avatar-wrap">
            <div className="settings-avatar">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" />
              ) : (
                <span>{avatarLetters}</span>
              )}
            </div>

            <button
              type="button"
              className="settings-avatar-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
            >
              {avatarLoading ? 'Zapisywanie...' : 'Zmień zdjęcie'}
            </button>

            <input
              ref={fileInputRef}
              className="settings-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              onChange={handleAvatarChange}
            />

            {/* <p className="settings-avatar-hint">
              JPG, PNG, WebP lub zdjęcie z telefonu. Maks. 20 MB przed kompresją.
            </p> */}

            {avatarError && (
              <p className="settings-field-error">{avatarError}</p>
            )}
          </div>

          <div className="settings-hero-copy">
            <p className="settings-eyebrow">USTAWIENIA KONTA</p>
            <h1>
              {user.firstName} {user.lastName}
            </h1>
            <span>{user.email}</span>
          </div>
        </header>

        <section className="settings-section">
          <div className="settings-section-heading">
            <p className="settings-eyebrow">PROFIL</p>
            <h2>Dane osobowe</h2>
            <span>Zarządzaj podstawowymi danymi swojego konta.</span>
          </div>

          <form className="settings-form" onSubmit={saveAccount} noValidate>
            <div className="settings-grid">
              <label className="settings-field">
                <span>Imię</span>
                <input
                  value={firstName}
                  maxLength={40}
                  onChange={(event) => setFirstName(event.target.value)}
                  className={errors.firstName ? 'has-error' : ''}
                />
                {errors.firstName && (
                  <small className="settings-field-error">
                    {errors.firstName}
                  </small>
                )}
              </label>

              <label className="settings-field">
                <span>Nazwisko</span>
                <input
                  value={lastName}
                  maxLength={60}
                  onChange={(event) => setLastName(event.target.value)}
                  className={errors.lastName ? 'has-error' : ''}
                />
                {errors.lastName && (
                  <small className="settings-field-error">
                    {errors.lastName}
                  </small>
                )}
              </label>

              <label className="settings-field">
                <span>E-mail</span>
                <input
                  type="email"
                  value={email}
                  maxLength={120}
                  onChange={(event) => setEmail(event.target.value)}
                  className={errors.email ? 'has-error' : ''}
                />
                {errors.email && (
                  <small className="settings-field-error">
                    {errors.email}
                  </small>
                )}
              </label>

              <div className="settings-field">
                <span>Telefon</span>

                <div className="settings-phone-control">
                  <div className="settings-country-picker">
                    <button
                      type="button"
                      className={`settings-country-trigger ${
                        errors.phone ? 'has-error' : ''
                      }`}
                      onClick={() =>
                        setCountryPickerOpen((current) => !current)
                      }
                    >
                      <span className="settings-country-flag">
                        {phoneCountry.flag}
                      </span>
                      <span>{phoneCountry.dialCode}</span>
                      <span className="settings-country-chevron">⌄</span>
                    </button>

                    {countryPickerOpen && (
                      <div className="settings-country-menu">
                        <input
                          autoFocus
                          type="search"
                          className="settings-country-search"
                          placeholder="Szukaj kraju..."
                          value={countrySearch}
                          onChange={(event) =>
                            setCountrySearch(event.target.value)
                          }
                        />

                        <div className="settings-country-list">
                          {COUNTRIES.filter((country) => {
                            const query = countrySearch.trim().toLowerCase()
                            if (!query) return true

                            return (
                              country.name.toLowerCase().includes(query) ||
                              country.dialCode.includes(query) ||
                              country.code.toLowerCase().includes(query)
                            )
                          }).map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              className={`settings-country-option ${
                                country.code === phoneCountry.code
                                  ? 'is-selected'
                                  : ''
                              }`}
                              onClick={() => {
                                setPhoneCountry(country)
                                setPhone('')
                                setCountryPickerOpen(false)
                                setCountrySearch('')
                                setErrors((current) => ({
                                  ...current,
                                  phone: undefined,
                                }))
                              }}
                            >
                              <span className="settings-country-flag">
                                {country.flag}
                              </span>
                              <span className="settings-country-name">
                                {country.name}
                              </span>
                              <span className="settings-country-code">
                                {country.dialCode}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    type="tel"
                    value={phone}
                    maxLength={phoneCountry.maxDigits + 4}
                    inputMode="numeric"
                    placeholder={
                      phoneCountry.code === 'PL'
                        ? '000 000 000'
                        : 'Numer telefonu'
                    }
                    onChange={(event) => {
                      setPhone(formatLocalPhone(event.target.value))
                      if (errors.phone) {
                        setErrors((current) => ({
                          ...current,
                          phone: undefined,
                        }))
                      }
                    }}
                    className={errors.phone ? 'has-error' : ''}
                  />
                </div>

                <small className="settings-phone-hint">
                  {phoneCountry.name} · {phoneCountry.dialCode} ·{' '}
                  {phoneCountry.minDigits === phoneCountry.maxDigits
                    ? `${phoneCountry.minDigits} cyfr`
                    : `${phoneCountry.minDigits}–${phoneCountry.maxDigits} cyfr`}
                </small>

                {errors.phone && (
                  <small className="settings-field-error">
                    {errors.phone}
                  </small>
                )}
              </div>

              <div className="settings-field settings-date-field">
                <span>Data urodzenia</span>

                <button
                  type="button"
                  className={`settings-date-trigger ${
                    errors.birthDate ? 'has-error' : ''
                  }`}
                  onClick={() => setDatePickerOpen((current) => !current)}
                >
                  <span>
                    {birthDate
                      ? formatDate(birthDate)
                      : 'Wybierz datę'}
                  </span>
                  <span className="settings-date-icon">⌄</span>
                </button>

                {datePickerOpen && (
                  <div className="settings-calendar">
                    <div className="settings-calendar__header">
                      <button
                        type="button"
                        onClick={() => moveMonth(-1)}
                        aria-label="Poprzedni miesiąc"
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        className="settings-calendar__title-button"
                        onClick={() => setCalendarMode('years')}
                      >
                        {monthLabel}
                      </button>

                      <button
                        type="button"
                        onClick={() => moveMonth(1)}
                        aria-label="Następny miesiąc"
                      >
                        ›
                      </button>
                    </div>

                    <div className="settings-calendar__weekdays">
                      {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(
                        (day) => (
                          <span key={day}>{day}</span>
                        ),
                      )}
                    </div>

                    {calendarMode === 'years' && (
                      <div className="settings-calendar__years">
                        {Array.from({ length: 100 }, (_, index) => {
                          const year = new Date().getFullYear() - index
                          return (
                            <button
                              key={year}
                              type="button"
                              className={
                                year === calendarMonth.getFullYear()
                                  ? 'is-selected'
                                  : ''
                              }
                              onClick={() => selectCalendarYear(year)}
                            >
                              {year}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {calendarMode === 'months' && (
                      <div className="settings-calendar__months">
                        {Array.from({ length: 12 }, (_, month) => (
                          <button
                            key={month}
                            type="button"
                            className={
                              month === calendarMonth.getMonth()
                                ? 'is-selected'
                                : ''
                            }
                            onClick={() => selectCalendarMonth(month)}
                          >
                            {new Intl.DateTimeFormat('pl-PL', {
                              month: 'short',
                            }).format(new Date(2025, month, 1))}
                          </button>
                        ))}
                      </div>
                    )}

                    {calendarMode === 'days' && (
                    <div className="settings-calendar__grid">
                      {daysForMonth(calendarMonth).map(
                        (date, index) => {
                          if (!date) {
                            return <span key={`empty-${index}`} />
                          }

                          const value = [
                            date.getFullYear(),
                            String(date.getMonth() + 1).padStart(2, '0'),
                            String(date.getDate()).padStart(2, '0'),
                          ].join('-')

                          return (
                            <button
                              key={value}
                              type="button"
                              className={
                                value === birthDate
                                  ? 'is-selected'
                                  : ''
                              }
                              onClick={() => selectDate(date)}
                            >
                              {date.getDate()}
                            </button>
                          )
                        },
                      )}
                    </div>
                    )}

                    {calendarMode !== 'days' && (
                      <button
                        type="button"
                        className="settings-calendar__switch"
                        onClick={() => setCalendarMode('days')}
                      >
                        Wróć do dni
                      </button>
                    )}
                  </div>
                )}

                {errors.birthDate && (
                  <small className="settings-field-error">
                    {errors.birthDate}
                  </small>
                )}
              </div>

              <label className="settings-field">
                <span>Płeć</span>
                <select
                  value={gender}
                  onChange={(event) =>
                    setGender(event.target.value as Gender)
                  }
                  className={errors.gender ? 'has-error' : ''}
                >
                  <option value="">Nie podano</option>
                  <option value="MALE">Mężczyzna</option>
                  <option value="FEMALE">Kobieta</option>
                  <option value="OTHER">Inna</option>
                </select>
                {errors.gender && (
                  <small className="settings-field-error">
                    {errors.gender}
                  </small>
                )}
              </label>
            </div>

            <div className="settings-actions">
              <button
                type="submit"
                className="settings-primary-button"
                disabled={accountLoading}
              >
                {accountLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </button>

              {accountMessage && (
                <p className="settings-status">{accountMessage}</p>
              )}
            </div>
          </form>
        </section>

        <section className="settings-section settings-security">
          <div className="settings-section-heading">
            <p className="settings-eyebrow">BEZPIECZEŃSTWO</p>
            <h2>Zmień hasło</h2>
            <span>
              Użyj silnego, unikalnego hasła, którego nie używasz
              w innych serwisach.
            </span>
          </div>

          <form
            className="settings-form"
            onSubmit={changePassword}
            noValidate
          >
            <div className="settings-password-grid">
              <label className="settings-field">
                <span>Aktualne hasło</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  className={
                    errors.currentPassword ? 'has-error' : ''
                  }
                />
                {errors.currentPassword && (
                  <small className="settings-field-error">
                    {errors.currentPassword}
                  </small>
                )}
              </label>

              <label className="settings-field">
                <span>Nowe hasło</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  className={errors.newPassword ? 'has-error' : ''}
                />
                {errors.newPassword && (
                  <small className="settings-field-error">
                    {errors.newPassword}
                  </small>
                )}
              </label>

              <label className="settings-field">
                <span>Powtórz nowe hasło</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  className={
                    errors.confirmPassword ? 'has-error' : ''
                  }
                />
                {errors.confirmPassword && (
                  <small className="settings-field-error">
                    {errors.confirmPassword}
                  </small>
                )}
              </label>
            </div>

            <div className="password-rules">
              <span className={passwordState.length ? 'valid' : ''}>
                8+ znaków
              </span>
              <span className={passwordState.uppercase ? 'valid' : ''}>
                Wielka litera
              </span>
              <span className={passwordState.lowercase ? 'valid' : ''}>
                Mała litera
              </span>
              <span className={passwordState.number ? 'valid' : ''}>
                Cyfra
              </span>
            </div>

            <div className="settings-actions">
              <button
                type="submit"
                className="settings-primary-button"
                disabled={passwordLoading || hasPasswordErrors}
              >
                {passwordLoading ? 'Zapisywanie...' : 'Zmień hasło'}
              </button>

              {passwordMessage && (
                <p className="settings-status">{passwordMessage}</p>
              )}
            </div>
          </form>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading">
            <p className="settings-eyebrow">LOGOWANIE</p>
            <h2>Połączone konta</h2>
            <span>
              Wybierz dodatkowy sposób logowania do PROGREFY.
            </span>
          </div>

          <div className="connected-accounts">
            <button type="button" className="connected-account">
              <span className="connected-account__brand google">G</span>
              <span>
                <strong>Google</strong>
                <small>Połączenie zostanie dodane w kolejnym kroku.</small>
              </span>
              <span className="connected-account__arrow">→</span>
            </button>

            <button type="button" className="connected-account">
              <span className="connected-account__brand apple"></span>
              <span>
                <strong>Apple</strong>
                <small>Połączenie zostanie dodane w kolejnym kroku.</small>
              </span>
              <span className="connected-account__arrow">→</span>
            </button>

            <button type="button" className="connected-account">
              <span className="connected-account__brand facebook">f</span>
              <span>
                <strong>Facebook</strong>
                <small>Połączenie zostanie dodane w kolejnym kroku.</small>
              </span>
              <span className="connected-account__arrow">→</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default SettingsPage
