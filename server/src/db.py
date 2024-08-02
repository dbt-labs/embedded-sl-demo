from src.models import StoreEmployee


class Database:
    """A fake database with fake data to illustrate the purpose."""

    def __init__(self) -> None:
        self._users: dict[int, StoreEmployee] = {}

    def insert_user(self, user: StoreEmployee) -> None:
        """Add a new user to the database."""
        assert user.id not in self._users
        self._users[user.id] = user

    def get_user(self, id: int) -> StoreEmployee | None:
        """Get a user from the database by id."""
        return self._users.get(id, None)


db = Database()
db.insert_user(
    StoreEmployee(
        id=0,
        name="Alice",
        store_location_name="Los Angeles",
    )
)
db.insert_user(
    StoreEmployee(
        id=1,
        name="Diego",
        store_location_name="San Francisco",
    )
)
db.insert_user(
    StoreEmployee(
        id=2,
        name="Devon",
        store_location_name="San Francisco",
    )
)
db.insert_user(
    StoreEmployee(
        id=3,
        name="Will",
        store_location_name="Chicago",
    )
)
