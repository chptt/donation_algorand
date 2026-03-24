"""
DonationPlatform - Algorand Smart Contract
Mirrors the Solidity DonationPlatform logic using Algorand Python (ARC4).

Each campaign is stored in a Box keyed by campaign_id (uint64).
Donations are tracked per (donor, campaign_id) in Box storage.
"""

from algopy import (
    ARC4Contract,
    Asset,
    BoxMap,
    Global,
    GlobalState,
    LocalState,
    Txn,
    UInt64,
    arc4,
    gtxn,
    itxn,
    op,
    subroutine,
    String,
    Bytes,
)
from algopy.arc4 import abimethod, UInt8, UInt64 as ARC4UInt64, String as ARC4String, Bool, Struct, Tuple


# ── Data Structures ──────────────────────────────────────────────────────────

class Campaign(Struct):
    campaign_id: ARC4UInt64
    charity_type: UInt8          # 0=Housing,1=Meals,2=Medical,3=Education,4=Equipment,5=RiverCleaning
    goal_amount: ARC4UInt64      # in microALGO
    total_donations: ARC4UInt64  # in microALGO
    creator: arc4.Address
    influencer_name: ARC4String
    profile_image_url: ARC4String
    active: Bool
    created_at: ARC4UInt64


# ── Contract ─────────────────────────────────────────────────────────────────

class DonationPlatform(ARC4Contract):
    """
    Algorand donation platform contract.
    Campaigns are stored in Box storage keyed by campaign_id.
    """

    def __init__(self) -> None:
        # Global counter for campaign IDs
        self.campaign_counter = GlobalState(UInt64(0))

        # Box: campaign_id (8 bytes) -> Campaign struct
        self.campaigns: BoxMap[ARC4UInt64, Campaign] = BoxMap(ARC4UInt64, Campaign, key_prefix=b"c_")

        # Box: (donor_address + campaign_id) -> donation amount in microALGO
        self.donations: BoxMap[Bytes, ARC4UInt64] = BoxMap(Bytes, ARC4UInt64, key_prefix=b"d_")

    # ── Campaign Management ───────────────────────────────────────────────────

    @abimethod
    def create_campaign(
        self,
        charity_type: UInt8,
        goal_amount: ARC4UInt64,
        influencer_name: ARC4String,
        profile_image_url: ARC4String,
    ) -> ARC4UInt64:
        """
        Create a new fundraising campaign.
        Returns the new campaign_id.
        """
        campaign_id = ARC4UInt64(self.campaign_counter.value)
        self.campaign_counter.value += UInt64(1)

        self.campaigns[campaign_id] = Campaign(
            campaign_id=campaign_id,
            charity_type=charity_type,
            goal_amount=goal_amount,
            total_donations=ARC4UInt64(0),
            creator=arc4.Address(Txn.sender),
            influencer_name=influencer_name,
            profile_image_url=profile_image_url,
            active=Bool(True),
            created_at=ARC4UInt64(Global.latest_timestamp),
        )

        return campaign_id

    @abimethod
    def donate(self, campaign_id: ARC4UInt64, payment: gtxn.PaymentTransaction) -> None:
        """
        Donate ALGO to a campaign.
        Caller must include a PaymentTransaction to the contract address.
        """
        assert campaign_id in self.campaigns, "Campaign does not exist"

        campaign = self.campaigns[campaign_id].copy()
        assert campaign.active.native, "Campaign is not active"
        assert payment.receiver == Global.current_application_address, "Payment must go to contract"
        assert payment.amount > UInt64(0), "Donation must be greater than 0"

        # Update total donations
        campaign.total_donations = ARC4UInt64(campaign.total_donations.as_uint64() + payment.amount)
        self.campaigns[campaign_id] = campaign.copy()

        # Track per-donor donation
        donor_key = Txn.sender.bytes + op.itob(campaign_id.as_uint64())
        existing = self.donations.get(donor_key, default=ARC4UInt64(0))
        self.donations[donor_key] = ARC4UInt64(existing.as_uint64() + payment.amount)

    @abimethod
    def withdraw(self, campaign_id: ARC4UInt64) -> None:
        """
        Withdraw all donations from a campaign.
        Only the campaign creator can call this.
        """
        assert campaign_id in self.campaigns, "Campaign does not exist"

        campaign = self.campaigns[campaign_id].copy()
        assert campaign.creator == arc4.Address(Txn.sender), "Not campaign creator"
        assert campaign.total_donations.as_uint64() > UInt64(0), "No donations to withdraw"

        amount = campaign.total_donations.as_uint64()

        # Mark campaign inactive and zero out donations
        campaign.total_donations = ARC4UInt64(0)
        campaign.active = Bool(False)
        self.campaigns[campaign_id] = campaign.copy()

        # Send ALGO back to creator
        itxn.Payment(
            receiver=Txn.sender,
            amount=amount,
            fee=Global.min_txn_fee,
        ).submit()

    # ── Read Methods ──────────────────────────────────────────────────────────

    @abimethod(readonly=True)
    def get_campaign(self, campaign_id: ARC4UInt64) -> Campaign:
        """Return campaign data by ID."""
        assert campaign_id in self.campaigns, "Campaign does not exist"
        return self.campaigns[campaign_id]

    @abimethod(readonly=True)
    def get_total_campaigns(self) -> ARC4UInt64:
        """Return total number of campaigns created."""
        return ARC4UInt64(self.campaign_counter.value)

    @abimethod(readonly=True)
    def get_donor_amount(self, campaign_id: ARC4UInt64, donor: arc4.Address) -> ARC4UInt64:
        """Return how much a specific donor has given to a campaign."""
        donor_key = donor.bytes + op.itob(campaign_id.as_uint64())
        return self.donations.get(donor_key, default=ARC4UInt64(0))
