"""
Tests for DonationPlatform Algorand contract.
Uses algorand-python-testing for unit tests (no LocalNet needed).

Run: pytest tests/ -v
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import algopy
from algopy import arc4, UInt64
from algopy_testing import algopy_testing_context

from contracts.donation_platform import DonationPlatform


@pytest.fixture()
def ctx():
    with algopy_testing_context() as context:
        yield context


@pytest.fixture()
def contract(ctx):
    return DonationPlatform()


def make_campaign(contract, charity=0, goal=5_000_000, name="Creator", url="https://img.png"):
    return contract.create_campaign(
        arc4.UInt8(charity),
        arc4.UInt64(goal),
        arc4.String(name),
        arc4.String(url),
    )


# ── basic campaign tests (implicit txn, no group needed) ─────────────────────

def test_create_campaign_returns_id(ctx, contract):
    campaign_id = make_campaign(contract)
    assert campaign_id.as_uint64() == 0


def test_create_increments_counter(ctx, contract):
    make_campaign(contract)
    make_campaign(contract)
    assert contract.get_total_campaigns().as_uint64() == 2


def test_campaign_ids_are_sequential(ctx, contract):
    id0 = make_campaign(contract)
    id1 = make_campaign(contract)
    assert id0.as_uint64() == 0
    assert id1.as_uint64() == 1


def test_get_campaign_data(ctx, contract):
    campaign_id = contract.create_campaign(
        arc4.UInt8(3),
        arc4.UInt64(5_000_000),
        arc4.String("Edu Campaign"),
        arc4.String("https://example.com/edu.png"),
    )
    campaign = contract.get_campaign(campaign_id)
    assert campaign.charity_type.as_uint64() == 3
    assert campaign.goal_amount.as_uint64() == 5_000_000
    assert campaign.influencer_name.native == "Edu Campaign"
    assert campaign.active.native is True
    assert campaign.total_donations.as_uint64() == 0


# ── donate / withdraw tests ───────────────────────────────────────────────────

def test_donate_increases_total(ctx, contract):
    """Donating increases campaign total_donations."""
    campaign_id = make_campaign(contract)
    donor = ctx.any.account(balance=UInt64(5_000_000))

    # Build group: [payment, app_call] — payment must come before app call
    app = ctx.ledger.get_app(contract)
    payment = ctx.any.txn.payment(
        sender=donor,
        receiver=app.address,
        amount=UInt64(1_000_000),
    )
    app_call = ctx.any.txn.application_call(sender=donor, app_id=app)

    with ctx.txn.create_group([payment, app_call]):
        contract.donate(campaign_id=campaign_id, payment=payment)

    campaign = contract.get_campaign(campaign_id)
    assert campaign.total_donations.as_uint64() == 1_000_000


def test_donor_amount_tracked(ctx, contract):
    """Per-donor donation amount is tracked correctly."""
    campaign_id = make_campaign(contract)
    donor = ctx.any.account(balance=UInt64(5_000_000))

    app = ctx.ledger.get_app(contract)
    payment = ctx.any.txn.payment(
        sender=donor,
        receiver=app.address,
        amount=UInt64(1_000_000),
    )
    app_call = ctx.any.txn.application_call(sender=donor, app_id=app)

    with ctx.txn.create_group([payment, app_call]):
        contract.donate(campaign_id=campaign_id, payment=payment)

    amount = contract.get_donor_amount(campaign_id, arc4.Address(donor))
    assert amount.as_uint64() == 1_000_000


def test_withdraw_clears_donations(ctx, contract):
    """Creator can withdraw; campaign becomes inactive with 0 donations."""
    creator = ctx.any.account()
    donor = ctx.any.account(balance=UInt64(5_000_000))
    app = ctx.ledger.get_app(contract)

    # Create campaign as creator
    with ctx.txn.create_group([ctx.any.txn.application_call(sender=creator, app_id=app)]):
        campaign_id = make_campaign(contract)

    # Donate
    payment = ctx.any.txn.payment(sender=donor, receiver=app.address, amount=UInt64(1_000_000))
    with ctx.txn.create_group([payment, ctx.any.txn.application_call(sender=donor, app_id=app)]):
        contract.donate(campaign_id=campaign_id, payment=payment)

    # Withdraw as creator
    with ctx.txn.create_group([ctx.any.txn.application_call(sender=creator, app_id=app)]):
        contract.withdraw(campaign_id=campaign_id)

    campaign = contract.get_campaign(campaign_id)
    assert campaign.total_donations.as_uint64() == 0
    assert campaign.active.native is False


def test_withdraw_not_creator_fails(ctx, contract):
    """Non-creator cannot withdraw."""
    creator = ctx.any.account()
    attacker = ctx.any.account()
    donor = ctx.any.account(balance=UInt64(5_000_000))
    app = ctx.ledger.get_app(contract)

    with ctx.txn.create_group([ctx.any.txn.application_call(sender=creator, app_id=app)]):
        campaign_id = make_campaign(contract)

    payment = ctx.any.txn.payment(sender=donor, receiver=app.address, amount=UInt64(500_000))
    with ctx.txn.create_group([payment, ctx.any.txn.application_call(sender=donor, app_id=app)]):
        contract.donate(campaign_id=campaign_id, payment=payment)

    with pytest.raises(Exception):
        with ctx.txn.create_group([ctx.any.txn.application_call(sender=attacker, app_id=app)]):
            contract.withdraw(campaign_id=campaign_id)
