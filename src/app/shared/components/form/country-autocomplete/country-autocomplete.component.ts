import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ElementRef,
  viewChild,
  effect,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeResourceUrlPipe } from '../../../pipe/safe-resource-url.pipe';
import { SafeStylePipe } from '../../../pipe/safe-style.pipe';

export interface CountryOption {
  name: string;
  code: string;
}

/** Base URL for flag images (FlagCDN - free, no API key) */
const FLAG_CDN = 'https://flagcdn.com';

/** Get flag image URL for ISO 3166-1 alpha-2 country code (e.g. US -> 40px width png) */
export function getFlagImageUrl(code: string, width = 40): string {
  if (!code || code.length !== 2) return '';
  return `${FLAG_CDN}/w${width}/${code.toLowerCase()}.png`;
}

const COUNTRIES: CountryOption[] = [
  { name: 'Afghanistan', code: 'AF' },
  { name: 'Albania', code: 'AL' },
  { name: 'Algeria', code: 'DZ' },
  { name: 'Argentina', code: 'AR' },
  { name: 'Australia', code: 'AU' },
  { name: 'Austria', code: 'AT' },
  { name: 'Bahrain', code: 'BH' },
  { name: 'Bangladesh', code: 'BD' },
  { name: 'Belgium', code: 'BE' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Bulgaria', code: 'BG' },
  { name: 'Canada', code: 'CA' },
  { name: 'Chile', code: 'CL' },
  { name: 'China', code: 'CN' },
  { name: 'Colombia', code: 'CO' },
  { name: 'Croatia', code: 'HR' },
  { name: 'Czech Republic', code: 'CZ' },
  { name: 'Denmark', code: 'DK' },
  { name: 'Egypt', code: 'EG' },
  { name: 'Estonia', code: 'EE' },
  { name: 'Ethiopia', code: 'ET' },
  { name: 'Finland', code: 'FI' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'Ghana', code: 'GH' },
  { name: 'Greece', code: 'GR' },
  { name: 'Hong Kong', code: 'HK' },
  { name: 'Hungary', code: 'HU' },
  { name: 'India', code: 'IN' },
  { name: 'Indonesia', code: 'ID' },
  { name: 'Iran', code: 'IR' },
  { name: 'Iraq', code: 'IQ' },
  { name: 'Ireland', code: 'IE' },
  { name: 'Israel', code: 'IL' },
  { name: 'Italy', code: 'IT' },
  { name: 'Japan', code: 'JP' },
  { name: 'Jordan', code: 'JO' },
  { name: 'Kenya', code: 'KE' },
  { name: 'Kuwait', code: 'KW' },
  { name: 'Lebanon', code: 'LB' },
  { name: 'Malaysia', code: 'MY' },
  { name: 'Mexico', code: 'MX' },
  { name: 'Morocco', code: 'MA' },
  { name: 'Netherlands', code: 'NL' },
  { name: 'New Zealand', code: 'NZ' },
  { name: 'Nigeria', code: 'NG' },
  { name: 'Norway', code: 'NO' },
  { name: 'Pakistan', code: 'PK' },
  { name: 'Peru', code: 'PE' },
  { name: 'Philippines', code: 'PH' },
  { name: 'Poland', code: 'PL' },
  { name: 'Portugal', code: 'PT' },
  { name: 'Romania', code: 'RO' },
  { name: 'Russia', code: 'RU' },
  { name: 'Saudi Arabia', code: 'SA' },
  { name: 'Serbia', code: 'RS' },
  { name: 'Singapore', code: 'SG' },
  { name: 'South Africa', code: 'ZA' },
  { name: 'South Korea', code: 'KR' },
  { name: 'Spain', code: 'ES' },
  { name: 'Sweden', code: 'SE' },
  { name: 'Switzerland', code: 'CH' },
  { name: 'Taiwan', code: 'TW' },
  { name: 'Thailand', code: 'TH' },
  { name: 'Tunisia', code: 'TN' },
  { name: 'Turkey', code: 'TR' },
  { name: 'Ukraine', code: 'UA' },
  { name: 'United Arab Emirates', code: 'AE' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'United States', code: 'US' },
  { name: 'Vietnam', code: 'VN' },
];

@Component({
  selector: 'app-country-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeResourceUrlPipe, SafeStylePipe],
  templateUrl: './country-autocomplete.component.html',
  styles: [
    `
      .dropdown-list {
        max-height: 240px;
        overflow-y: auto;
      }
    `,
  ],
})
export class CountryAutocompleteComponent {
  @Input() value: string = '';
  @Input() placeholder = 'Select or type country...';
  @Input() disabled = false;
  @Input() id = 'country';
  @Output() valueChange = new EventEmitter<string>();

  readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputRef');

  isOpen = signal(false);
  query = signal('');
  selectedCountry = signal<CountryOption | null>(null);

  readonly allCountries = COUNTRIES;

  /** Flag image URL for binding (dropdown uses safe URL to avoid sanitizer blocking) */
  getFlagImageUrl(code: string, width = 40): string {
    return getFlagImageUrl(code, width);
  }

  getFlagImageSafeUrl(code: string, width = 40): SafeResourceUrl {
    const url = getFlagImageUrl(code, width);
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : '';
  }

  filteredOptions = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.allCountries;
    return this.allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  });

  displayText = computed(() => {
    const selected = this.selectedCountry();
    if (selected) return selected.name;
    return this.query();
  });

  constructor(private sanitizer: DomSanitizer) {
    effect(() => {
      const v = this.value;
      if (v) {
        const found = this.allCountries.find(
          (c) => c.code === v || c.name === v
        );
        this.selectedCountry.set(found || null);
        this.query.set(found ? '' : v);
      } else {
        this.selectedCountry.set(null);
        this.query.set('');
      }
    });
  }

  onInput(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.query.set(val);
    this.selectedCountry.set(null);
    this.valueChange.emit('');
    this.isOpen.set(true);
  }

  onFocus(): void {
    if (!this.disabled) this.isOpen.set(true);
  }

  onBlur(): void {
    setTimeout(() => this.isOpen.set(false), 200);
  }

  select(country: CountryOption): void {
    this.selectedCountry.set(country);
    this.query.set('');
    this.valueChange.emit(country.code);
    this.isOpen.set(false);
  }

  clear(): void {
    this.selectedCountry.set(null);
    this.query.set('');
    this.valueChange.emit('');
    this.query.set('');
    this.inputRef()?.nativeElement?.focus();
  }
}
