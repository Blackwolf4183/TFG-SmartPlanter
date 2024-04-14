from pydantic import BaseModel

class VoteInfo(BaseModel):
    hasVotedToday: bool
    vote: int
