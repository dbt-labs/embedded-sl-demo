from src.auth.models import User


class Database:
    """A fake database with fake data to illustrate the purpose."""

    def __init__(self) -> None:  # noqa: D107
        self._users: dict[int, User] = {}

    def insert_user(self, user: User) -> None:
        """Add a new user to the database."""
        assert user.id not in self._users
        self._users[user.id] = user

    def get_user(self, id: int) -> User | None:
        """Get a user from the database by id."""
        return self._users.get(id, None)

    def get_user_by_email_and_password(self, email: str, password: str) -> User | None:
        """Get a user from the database by their login credentials."""
        for user in self._users.values():
            if user.email == email and user.password == password:
                return user

        return None


# NOTE: this is a fake in-memory database with plaintext passwords for demonstration purposes.
# Needless to say, don't do this in real life :)
db = Database()

db.insert_user(
    User(
        id=0,
        name="Alice",
        store_location_name="Los Angeles",
        email="alice@jaffle.shop",
        password="alice",
    )
)
db.insert_user(
    User(
        id=1,
        name="Diego",
        store_location_name="San Francisco",
        email="diego@jaffle.shop",
        password="diego",
    )
)
db.insert_user(
    User(
        id=2,
        name="Devon",
        store_location_name="San Francisco",
        email="devon@jaffle.shop",
        password="devon",
    )
)
db.insert_user(
    User(
        id=3,
        name="Will",
        store_location_name="Chicago",
        email="will@jaffle.shop",
        password="will",
    )
)
