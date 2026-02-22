import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  viewChild,
  effect,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  AsYouType,
  type CountryCode,
} from 'libphonenumber-js';
import { SafeStylePipe } from '../../../pipe/safe-style.pipe';

const FLAG_CDN = 'https://flagcdn.com';
function getFlagImageUrl(code: string, width = 40): string {
  if (!code || code.length !== 2) return '';
  return `${FLAG_CDN}/w${width}/${code.toLowerCase()}.png`;
}

export interface PhoneCountryOption {
  code: CountryCode;
  callingCode: string;
  name: string;
}

const DEFAULT_COUNTRY: CountryCode = 'US';

function buildCountryOptions(): PhoneCountryOption[] {
  const codes = getCountries();
  const nameFormatter = new Intl.DisplayNames(['en'], { type: 'region' });
  return codes
    .map((code): PhoneCountryOption | null => {
      try {
        const callingCode = String(getCountryCallingCode(code));
        const name = nameFormatter.of(code) ?? code;
        return { code, callingCode, name };
      } catch {
        return null;
      }
    })
    .filter((c): c is PhoneCountryOption => c != null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

const COUNTRY_OPTIONS = buildCountryOptions();
const INITIAL_COUNTRY =
  COUNTRY_OPTIONS.find((c) => c.code === DEFAULT_COUNTRY) ?? COUNTRY_OPTIONS[0] ?? null;

@Component({
  selector: 'app-phone-number-input',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeStylePipe],
  templateUrl: './phone-number-input.component.html',
  styles: [
    `
      .phone-dropdown {
        max-height: 240px;
        overflow-y: auto;
      }
    `,
  ],
})
export class PhoneNumberInputComponent {
  @Input() value = '';
  @Input() placeholder = 'Phone number';
  @Input() disabled = false;
  @Input() id = 'phone';
  @Input() name = 'phoneNumber';
  @Output() valueChange = new EventEmitter<string>();
  /** Emits ISO country code when detected from the number (e.g. US, GB). */
  @Output() countryChange = new EventEmitter<string>();

  readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputRef');

  readonly countryOptions = COUNTRY_OPTIONS;

  /** Currently selected country for the selector. */
  selectedCountry = signal<PhoneCountryOption | null>(INITIAL_COUNTRY);
  /** Raw input value (national or international string). */
  inputValue = signal('');
  /** Dropdown open state. */
  isOpen = signal(false);
  /** Whether the current input is invalid (and we have some input). */
  invalid = signal(false);
  /** Whether user has interacted with the field (for showing validation). */
  touched = signal(false);

  /** Default country option (e.g. US). */
  defaultOption = computed(() =>
    this.countryOptions.find((c) => c.code === DEFAULT_COUNTRY) ?? this.countryOptions[0]
  );

  /** Current E.164 value when valid; empty otherwise. */
  e164 = computed(() => {
    const raw = this.inputValue().trim();
    if (!raw) return '';
    const country = this.selectedCountry()?.code ?? DEFAULT_COUNTRY;
    const parsed = parsePhoneNumberFromString(raw, country);
    if (parsed?.isValid()) return parsed.number;
    const parsedAny = parsePhoneNumberFromString(raw);
    return parsedAny?.isValid() ? parsedAny.number : '';
  });

  constructor() {
    effect(() => {
      const v = this.value;
      if (v && v.startsWith('+')) {
        const parsed = parsePhoneNumberFromString(v);
        if (parsed?.country) {
          const opt = this.countryOptions.find((c) => c.code === parsed!.country);
          if (opt) {
            this.selectedCountry.set(opt);
            this.inputValue.set(parsed!.formatNational());
          }
        }
      } else if (!v) {
        const def = this.defaultOption();
        this.selectedCountry.set(def);
        this.inputValue.set('');
      }
    });
  }

  getFlagImageUrl(code: string, width = 40): string {
    return getFlagImageUrl(code, width); // uses local FLAG_CDN helper above
  }

  onInput(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.inputValue.set(val);
    this.touched.set(true);
    this.updateFromInput(val);
  }

  private updateFromInput(val: string): void {
    const trimmed = val.trim();
    if (!trimmed) {
      this.valueChange.emit('');
      this.countryChange.emit('');
      this.invalid.set(false);
      const def = this.defaultOption();
      this.selectedCountry.set(def);
      return;
    }
    const asYouType = new AsYouType();
    asYouType.input(trimmed);
    const detectedCountry = asYouType.getCountry();
    if (detectedCountry) {
      const opt = this.countryOptions.find((c) => c.code === detectedCountry);
      if (opt) this.selectedCountry.set(opt);
    }
    const country = this.selectedCountry()?.code ?? DEFAULT_COUNTRY;
    const parsed = parsePhoneNumberFromString(trimmed, country);
    const valid = parsed?.isValid() ?? false;
    const parsedAny = parsePhoneNumberFromString(trimmed);
    const validAny = parsedAny?.isValid() ?? false;
    this.invalid.set(trimmed.length > 0 && !valid && !validAny);
    if (valid) {
      this.valueChange.emit(parsed!.number);
      this.countryChange.emit(parsed!.country ?? '');
    } else if (validAny && parsedAny) {
      this.valueChange.emit(parsedAny.number);
      this.countryChange.emit(parsedAny.country ?? '');
    } else {
      this.valueChange.emit('');
      this.countryChange.emit('');
    }
  }

  selectCountry(opt: PhoneCountryOption): void {
    this.selectedCountry.set(opt);
    this.isOpen.set(false);
    const val = this.inputValue().trim();
    if (val) this.updateFromInput(val);
  }

  onFocus(): void {
    if (!this.disabled) this.isOpen.set(false);
  }

  onBlur(): void {
    this.touched.set(true);
    setTimeout(() => this.isOpen.set(false), 200);
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen.update((o) => !o);
  }

  get displayCallingCode(): string {
    const sel = this.selectedCountry();
    return sel ? `+${sel.callingCode}` : '';
  }
}
