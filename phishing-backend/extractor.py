import re
from urllib.parse import urlparse
import socket

# ✅ Basic domain validation regex
def is_valid_domain(domain):
    return re.match(
        r"^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,})+$",
        domain
    ) is not None

def extract_features_from_url(url):
    features = {}

    # Ensure URL has a scheme for parsing
    parsed = urlparse(url if "://" in url else "http://" + url)
    domain = parsed.netloc

    # ❌ Reject invalid domains early
    if not is_valid_domain(domain):
        raise ValueError("Invalid domain format")

    # 1. having_IP_Address
    try:
        socket.inet_aton(domain)
        features['having_IP_Address'] = -1
    except:
        features['having_IP_Address'] = 1

    # 2. URL_Length
    length = len(url)
    features['URL_Length'] = 1 if length < 54 else 0 if length <= 75 else -1

    # 3. Shortining_Service
    shortening_services = r"bit\.ly|goo\.gl|shorte\.st|go2l\.ink|x\.co|ow\.ly|t\.co|tinyurl|tr\.im|is\.gd"
    features['Shortining_Service'] = -1 if re.search(shortening_services, url) else 1

    # 4. having_At_Symbol
    features['having_At_Symbol'] = -1 if '@' in url else 1

    # 5. double_slash_redirecting
    features['double_slash_redirecting'] = -1 if url.rfind('//') > 6 else 1

    # 6. Prefix_Suffix
    features['Prefix_Suffix'] = -1 if '-' in domain else 1

    # 7. having_Sub_Domain
    dots = domain.split('.')
    if len(dots) <= 2:
        features['having_Sub_Domain'] = 1
    elif len(dots) == 3:
        features['having_Sub_Domain'] = 0
    else:
        features['having_Sub_Domain'] = -1

    # 8. SSLfinal_State — only if actual https
    features['SSLfinal_State'] = 1 if parsed.scheme.lower() == "https" else -1

    # 9. Domain_registeration_length
    features['Domain_registeration_length'] = -1

    # 10. Favicon
    features['Favicon'] = 1

    # 11. port
    features['port'] = -1 if ":" in domain else 1

    # 12. HTTPS_token
    features['HTTPS_token'] = -1 if 'https' in parsed.path.lower() else 1

    # 13–15. Request_URL, URL_of_Anchor, Links_in_tags
    features['Request_URL'] = -1
    features['URL_of_Anchor'] = -1
    features['Links_in_tags'] = -1

    # 16. SFH
    features['SFH'] = -1

    # 17. Submitting_to_email
    features['Submitting_to_email'] = -1 if "mailto:" in url else 1

    # 18. Abnormal_URL
    features['Abnormal_URL'] = -1

    # 19. Redirect
    features['Redirect'] = -1

    # 20–23. on_mouseover, RightClick, popUpWidnow, Iframe
    features['on_mouseover'] = -1
    features['RightClick'] = 1
    features['popUpWidnow'] = -1
    features['Iframe'] = -1

    # 24. age_of_domain
    features['age_of_domain'] = -1

    # 25. DNSRecord
    features['DNSRecord'] = -1

    # 26. web_traffic
    features['web_traffic'] = -1

    # 27. Page_Rank
    features['Page_Rank'] = -1

    # 28. Google_Index
    features['Google_Index'] = 1

    # 29. Links_pointing_to_page
    features['Links_pointing_to_page'] = -1

    # 30. Statistical_report
    features['Statistical_report'] = -1

    return features
