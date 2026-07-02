from django.contrib.auth.tokens import PasswordResetTokenGenerator


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    """Token generator for e-mail verification links.

    Hashing includes `is_email_verified` so the token stops working once the
    address has been confirmed.
    """

    def _make_hash_value(self, user, timestamp):
        return f"{user.pk}{timestamp}{user.is_email_verified}{user.email}"


email_verification_token = EmailVerificationTokenGenerator()
