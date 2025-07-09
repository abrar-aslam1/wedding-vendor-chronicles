#!/usr/bin/env python3
"""
Configuration for automated vendor research system
Defines cities, categories, and automation parameters
"""

# Cities to research (can be expanded)
TARGET_CITIES = {
    'Dallas': {
        'state': 'TX',
        'metro_area': 'DFW',
        'aliases': ['Dallas', 'DFW', 'Dallas-Fort Worth'],
        'priority': 'high'
    },
    'Austin': {
        'state': 'TX', 
        'metro_area': 'Austin',
        'aliases': ['Austin', 'ATX'],
        'priority': 'high'
    },
    'Houston': {
        'state': 'TX',
        'metro_area': 'Houston',
        'aliases': ['Houston', 'HTX'],
        'priority': 'medium'
    },
    'San Antonio': {
        'state': 'TX',
        'metro_area': 'San Antonio',
        'aliases': ['San Antonio', 'SA'],
        'priority': 'medium'
    }
}

# Vendor categories to research
VENDOR_CATEGORIES = {
    'florists': {
        'platform_names': ['wedding-florists', 'florists', 'floral-design'],
        'instagram_keywords': ['flowers', 'floral', 'blooms', 'petals'],
        'priority': 'high'
    },
    'photographers': {
        'platform_names': ['wedding-photographers', 'photographers', 'photography'],
        'instagram_keywords': ['photo', 'photography', 'photographer', 'wedding'],
        'priority': 'high'
    },
    'makeup-artists': {
        'platform_names': ['makeup-artists', 'hair-makeup', 'beauty'],
        'instagram_keywords': ['makeup', 'beauty', 'mua', 'glam'],
        'priority': 'medium'
    },
    'wedding-planners': {
        'platform_names': ['wedding-planners', 'planners', 'coordinators'],
        'instagram_keywords': ['wedding', 'planner', 'events', 'coordination'],
        'priority': 'high'
    },
    'venues': {
        'platform_names': ['venues', 'reception-venues', 'ceremony-venues'],
        'instagram_keywords': ['venue', 'events', 'wedding', 'reception'],
        'priority': 'medium'
    }
}

# Automation settings
AUTOMATION_CONFIG = {
    'max_vendors_per_category': 10,
    'max_vendors_per_city': 50,
    'rate_limit_delay': 2,  # seconds between requests
    'instagram_verification_delay': 1,  # seconds between Instagram checks
    'max_handle_variations': 5,
    'platforms_to_search': ['weddingwire', 'theknot', 'zola'],
    'backup_search_engines': ['google', 'bing']
}

# Instagram handle generation patterns
HANDLE_PATTERNS = [
    '{business_name}',
    '{business_name}{city}',
    '{business_name}_{city}',
    '{business_name}tx',
    '{business_name}_tx',
    '{business_name}wedding',
    '{business_name}_wedding',
    '{category}{city}',
    '{category}_{city}'
]

# Business name cleaning rules
BUSINESS_NAME_CLEANING = {
    'remove_words': ['LLC', 'Inc', 'Corporation', 'Corp', 'Company', 'Co'],
    'remove_phrases': ['Wedding Photography', 'Wedding Planning', 'Floral Design'],
    'replace_chars': {
        '&': 'and',
        '+': 'plus',
        '.': '',
        ',': '',
        "'": '',
        '"': ''
    }
}

# Quality filters
QUALITY_FILTERS = {
    'min_business_name_length': 3,
    'max_business_name_length': 50,
    'exclude_generic_names': [
        'Wedding Photographer',
        'Dallas Florist', 
        'Wedding Planner',
        'Event Venue'
    ],
    'require_instagram_posts': True,
    'min_instagram_handle_length': 3,
    'max_instagram_handle_length': 30
}