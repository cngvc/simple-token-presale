const contractErrors = [
  'LowBalance',
  'EthPaymentFailed',
  'TokenTransferFailed',
  'NoClaimableAmount',
  'PresaleTokenAddressNotSet',
  'NotEnoughTokensInTheContract',
  'ClaimIsNotEnable',
  'PromoCodeUsageLimitReached',
  'ZeroTokenAddress',
  'ZeroPrice',
  'ZeroTokensToSell',
  'ZeroHardcap',
  'PositiveBonusToken',
  'PresaleDoesNotExist',
  'PresaleHasBeenPaused',
  'PresaleIsNotActiveYet',
  'AccountIsBlackListed',
  'LessThanMinAmount',
  'MakeSureToAddEnoughAllowance',
  'TokenPaymentFailed',
  'NothingToClaim',
  'AlreadyClaimed',
  'UserNotAParticipant',
  'PleaseWaitTillNextClaim',
  'WaitForNextClaim',
  'AlreadyPaused',
  'NotPaused',
  'InvalidPresaleId',
  'PresaleNotActive',
  'InvalidSaleAmount',
  'PromoCodeDoesNotExist',
  'CodeMustNotBeEmpty',
  'UsageLimitMustBeGreaterThanZero',
  'InvalidDiscountPercentage',
  'StageSoldOut',

  'User rejected the request',
  'undefined Request Arguments',
  'Make sure to add enough allowance',
  'The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account'
]

function convertToHumanReadable(errorCode) {
  // Split the string by capital letters
  const words = errorCode.split(/(?=[A-Z])/)

  // Join the words with space and convert the first letter to uppercase
  const humanReadable = words.join(' ').charAt(0).toUpperCase() + words.join(' ').slice(1)

  return humanReadable
}

export const errorMessage = (raw) => {
  for (let i = 0; i < contractErrors.length; i++) {
    const error = contractErrors[i]
    if (raw.includes(error)) {
      if (error === 'StageSoldOut') {
        return 'Stage sold out, please try to contact support!'
      }
      return convertToHumanReadable(error)
    }
  }
  return raw
}
