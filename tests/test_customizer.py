"""
Tests for the customizer module.

Covers:
  - Each field validator (valid + invalid inputs)
  - CustomizationConfig defaults, from_dict, validate, is_valid
  - Generator output correctness (header/body/footer HTML and CSS)
  - Full-page HTML assembly
  - Convenience generate_html() wrapper
"""

import pytest

from customizer import (
    CustomizationConfig,
    validate_title,
    validate_description,
    validate_background_color,
    validate_logo_url,
    validate_company_name,
    generate_header_css,
    generate_header_html,
    generate_body_css,
    generate_body_html,
    generate_footer_css,
    generate_footer_html,
    generate_full_css,
    generate_full_html,
    generate_html,
)


# ---------------------------------------------------------------------------
# Validator tests
# ---------------------------------------------------------------------------

class TestValidateTitle:
    """title: required, max 128 chars, whitespace-only is invalid."""

    # -- valid --
    def test_single_word(self):
        assert validate_title('PRMS') is None

    def test_sentence(self):
        assert validate_title('Property Rental Management System') is None

    def test_whitespace_stripped(self):
        assert validate_title('  Hello World  ') is None

    def test_max_length(self):
        assert validate_title('x' * 128) is None

    # -- invalid --
    def test_empty(self):
        err = validate_title('')
        assert err is not None
        assert 'empty' in err.lower()

    def test_whitespace_only(self):
        err = validate_title('   ')
        assert err is not None

    def test_over_max(self):
        err = validate_title('x' * 129)
        assert err is not None
        assert '128' in err


class TestValidateDescription:
    """description: optional, max 512 chars."""

    def test_empty_is_valid(self):
        assert validate_description('') is None

    def test_normal_text(self):
        assert validate_description('A short tagline') is None

    def test_max_length(self):
        assert validate_description('x' * 512) is None

    def test_over_max(self):
        err = validate_description('x' * 513)
        assert err is not None
        assert '512' in err


class TestValidateBackgroundColor:
    """background_color: hex string matching #RGB, #RGBA, #RRGGBB, #RRGGBBAA,
    or longer hex (up to 8 hex digits after #)."""

    # -- valid --
    def test_3_hex(self):
        assert validate_background_color('#FFF') is None

    def test_4_hex(self):
        assert validate_background_color('#FFFA') is None

    def test_6_hex(self):
        assert validate_background_color('#112233') is None

    def test_8_hex(self):
        assert validate_background_color('#AABBCCDD') is None

    def test_mixed_case(self):
        assert validate_background_color('#aAbBcC') is None

    def test_with_hash(self):
        assert validate_background_color('#F3F6FB') is None

    # -- invalid --
    def test_no_hash(self):
        err = validate_background_color('FFFFFF')
        assert err is not None

    def test_not_hex(self):
        err = validate_background_color('#ZZZZZZ')
        assert err is not None

    def test_empty(self):
        err = validate_background_color('')
        assert err is not None

    def test_color_name(self):
        err = validate_background_color('white')
        assert err is not None

    def test_rgb_function(self):
        err = validate_background_color('rgb(255,255,255)')
        assert err is not None


class TestValidateLogoUrl:
    """logo_url: required, must be a valid HTTP(S) URL."""

    # -- valid --
    def test_http_url(self):
        assert validate_logo_url('http://example.com/logo.png') is None

    def test_https_url(self):
        assert validate_logo_url('https://cdn.example.com/image.svg') is None

    def test_with_path_and_query(self):
        assert validate_logo_url('https://img.io/1.png?v=2') is None

    def test_with_fragment(self):
        assert validate_logo_url('https://img.io/1.png#main') is None

    # -- invalid --
    def test_empty(self):
        err = validate_logo_url('')
        assert err is not None
        assert 'required' in err.lower()

    def test_no_scheme(self):
        err = validate_logo_url('example.com/logo.png')
        assert err is not None

    def test_ftp(self):
        err = validate_logo_url('ftp://example.com/foo.png')
        assert err is not None

    def test_data_url(self):
        err = validate_logo_url('data:image/png;base64,abc')
        assert err is not None

    def test_local_path(self):
        err = validate_logo_url('/var/www/logo.png')
        assert err is not None


class TestValidateCompanyName:
    """company_name: required, max 128 chars, whitespace-only is invalid."""

    def test_normal(self):
        assert validate_company_name('Acme Corp') is None

    def test_whitespace_stripped(self):
        assert validate_company_name('  My Company  ') is None

    def test_max_length(self):
        assert validate_company_name('x' * 128) is None

    def test_empty(self):
        err = validate_company_name('')
        assert err is not None
        assert 'empty' in err.lower()

    def test_whitespace_only(self):
        err = validate_company_name('   ')
        assert err is not None

    def test_over_max(self):
        err = validate_company_name('x' * 129)
        assert err is not None
        assert '128' in err


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class TestCustomizationConfig:
    """Defaults, from_dict, aggregate validation."""

    def test_defaults(self):
        cfg = CustomizationConfig()
        assert cfg.title == 'PRMS'
        assert cfg.description == 'Property Rental Management System'
        assert cfg.background_color == '#F3F6FB'
        assert cfg.logo_url == ''
        assert cfg.company_name == 'Property Rental Management System'

    def test_custom_values(self):
        cfg = CustomizationConfig(
            title='My Site',
            description='A test site',
            background_color='#000',
            logo_url='https://example.com/logo.png',
            company_name='Test Corp',
        )
        assert cfg.title == 'My Site'
        assert cfg.description == 'A test site'
        assert cfg.background_color == '#000'
        assert cfg.logo_url == 'https://example.com/logo.png'
        assert cfg.company_name == 'Test Corp'

    def test_from_dict_full(self):
        data = {
            'title': 'My Site',
            'description': 'Tagline',
            'background_color': '#ABC',
            'logo_url': 'https://a.com/b.png',
            'company_name': 'Co',
        }
        cfg = CustomizationConfig.from_dict(data)
        assert cfg.title == 'My Site'
        assert cfg.background_color == '#ABC'

    def test_from_dict_partial(self):
        cfg = CustomizationConfig.from_dict({'title': 'Only Title'})
        assert cfg.title == 'Only Title'
        assert cfg.description == 'Property Rental Management System'  # default

    def test_from_dict_empty(self):
        cfg = CustomizationConfig.from_dict({})
        assert cfg.title == 'PRMS'

    def test_validate_no_errors(self):
        cfg = CustomizationConfig(
            title='Test',
            description='Desc',
            background_color='#FFF',
            logo_url='https://example.com/l.png',
            company_name='Co',
        )
        assert cfg.validate() == []
        assert cfg.is_valid is True

    def test_validate_multiple_errors(self):
        cfg = CustomizationConfig(
            title='',
            description='x' * 600,
            background_color='red',
            logo_url='',
            company_name='',
        )
        errors = cfg.validate()
        # title empty, description too long, background_color invalid,
        # logo_url required, company_name empty => 5 errors
        assert len(errors) == 5

    def test_is_valid_with_errors(self):
        cfg = CustomizationConfig(title='', logo_url='', company_name='')
        assert cfg.is_valid is False

    def test_validate_with_logo_url_empty(self):
        cfg = CustomizationConfig(
            title='OK',
            logo_url='',
            company_name='OK',
        )
        errors = cfg.validate()
        assert any('logo_url' in e for e in errors)


# ---------------------------------------------------------------------------
# Generator tests
# ---------------------------------------------------------------------------

class TestGenerateHeaderCss:
    def test_default_background(self):
        css = generate_header_css()
        assert '#FFFFFF' in css

    def test_custom_background(self):
        css = generate_header_css(background_color='#123456')
        assert '#123456' in css

    def test_contains_logo_rules(self):
        css = generate_header_css()
        assert 'header.header' in css
        assert 'max-height' in css

    def test_custom_logo_max_height(self):
        css = generate_header_css(logo_max_height=60)
        assert 'max-height: 60px' in css


class TestGenerateHeaderHtml:
    def test_basic(self):
        html = generate_header_html('Site', '', 'Company')
        assert '<header' in html
        assert 'Site' in html

    def test_with_logo(self):
        html = generate_header_html('Site', 'https://x.com/l.png', 'Co')
        assert '<img src="https://x.com/l.png"' in html
        assert 'alt="Co logo"' in html

    def test_without_logo(self):
        html = generate_header_html('Site', '', 'Co')
        assert '<img' not in html

    def test_html_escaping(self):
        html = generate_header_html('A & B', 'https://x.com/l.png?q=1&r=2', 'A "B"')
        assert 'A &amp; B' in html
        assert 'A &quot;B&quot;' in html


class TestGenerateBodyCss:
    def test_includes_background(self):
        css = generate_body_css('#AAAAAA')
        assert '#AAAAAA' in css

    def test_contains_main_rules(self):
        css = generate_body_css('#FFF')
        assert 'main.body' in css


class TestGenerateBodyHtml:
    def test_title(self):
        html = generate_body_html('Home', '')
        assert '<h1>Home</h1>' in html

    def test_with_description(self):
        html = generate_body_html('Home', 'A description')
        assert '<p class="description">A description</p>' in html

    def test_without_description(self):
        html = generate_body_html('Home', '')
        assert 'description' not in html


class TestGenerateFooterCss:
    def test_default(self):
        css = generate_footer_css()
        assert 'footer.footer' in css

    def test_custom_background(self):
        css = generate_footer_css('#FF0000')
        assert '#FF0000' in css


class TestGenerateFooterHtml:
    def test_company_name(self):
        html = generate_footer_html('Acme Corp', year=2026)
        assert 'Acme Corp' in html

    def test_copyright(self):
        html = generate_footer_html('Acme', year=2026)
        assert '&copy; 2026' in html

    def test_default_year(self):
        html = generate_footer_html('Co')
        assert '&copy;' in html


class TestGenerateFullCss:
    def test_combined(self):
        cfg = CustomizationConfig()
        css = generate_full_css(cfg)
        assert ':root' in css
        assert 'header.header' in css
        assert 'main.body' in css
        assert 'footer.footer' in css


class TestGenerateFullHtml:
    def test_doctype(self):
        cfg = CustomizationConfig(
            title='T',
            logo_url='https://example.com/l.png',
            company_name='C',
        )
        html = generate_full_html(cfg)
        assert '<!DOCTYPE html>' in html

    def test_with_css(self):
        cfg = CustomizationConfig(
            title='T',
            logo_url='https://example.com/l.png',
            company_name='C',
        )
        html = generate_full_html(cfg, include_css_tag=True)
        assert '<style>' in html

    def test_without_css(self):
        cfg = CustomizationConfig(
            title='T',
            logo_url='https://example.com/l.png',
            company_name='C',
        )
        html = generate_full_html(cfg, include_css_tag=False)
        assert '<style>' not in html

    def test_contains_all_sections(self):
        cfg = CustomizationConfig(
            title='T',
            description='D',
            logo_url='https://example.com/l.png',
            company_name='C',
        )
        html = generate_full_html(cfg)
        assert 'header' in html
        assert 'main' in html
        assert 'footer' in html

    def test_background_color_in_css(self):
        cfg = CustomizationConfig(
            title='T',
            background_color='#DEADBEEF',
            logo_url='https://example.com/l.png',
            company_name='C',
        )
        html = generate_full_html(cfg)
        assert '#DEADBEEF' in html

    def test_logo_in_header(self):
        cfg = CustomizationConfig(
            title='T',
            logo_url='https://pic.io/a.svg',
            company_name='C',
        )
        html = generate_full_html(cfg)
        assert 'src="https://pic.io/a.svg"' in html

    def test_company_name_in_footer(self):
        cfg = CustomizationConfig(
            title='T',
            logo_url='https://example.com/l.png',
            company_name='My Company',
        )
        html = generate_full_html(cfg)
        assert 'My Company' in html


class TestGenerateHtmlConvenience:
    """Smoke-test the one-shot convenience wrapper."""

    def test_defaults(self):
        html = generate_html()
        assert '<!DOCTYPE html>' in html
        assert 'PRMS' in html

    def test_custom_background(self):
        html = generate_html(background_color='#123456')
        assert '#123456' in html

    def test_custom_logo(self):
        html = generate_html(logo_url='https://logo.io/x.png')
        assert 'src="https://logo.io/x.png"' in html

    def test_custom_company(self):
        html = generate_html(company_name='Beta Inc')
        assert 'Beta Inc' in html
