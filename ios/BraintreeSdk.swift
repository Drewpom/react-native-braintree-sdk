import Foundation
import React
import Braintree
import PassKit
//import BraintreeCard
//import BraintreeApplePay
//import BraintreeVenmo

extension BTCardNetwork {
    var networkName: String {
        switch self {
        case .AMEX:
          return "AMEX"
        case .dinersClub:
          return "DinersClub"
        case .discover:
          return "Discover"
        case .masterCard:
          return "MasterCard"
        case .visa:
          return "Visa"
        case .JCB:
          return "JCB"
        case .laser:
          return "Laser"
        case .maestro:
          return "Maestro"
        case .unionPay:
          return "UnionPay"
        case .hiper:
          return "Hiper"
        case .hipercard:
          return "Hipercard"
        case .solo:
          return "Solo"
        case .switch:
          return "Switch"
        case .ukMaestro:
          return "UKMaestro"
        default:
          return "Unknown"
        }
    }
}
 
extension BTCardNonce {
    var json: [String: String?] {
        return [
            "cardNetwork": cardNetwork.networkName,
            "expirationMonth": expirationMonth,
            "expirationYear": expirationYear,
            "cardholderName": cardholderName,
            "lastTwo": lastTwo,
            "lastFour": lastFour,
            "bin": bin,
            "nonce": nonce
        ]
    }
}

enum RNBraintreeSdkError: Error {
    case invalidApplePayLineItems
}

@objc(BraintreeSdk)
class BraintreeSdk: NSObject {
  var braintreeClient: BTAPIClient?
  var braintreeApple: BTApplePayClient?
  var inProgressPromise: (resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock)?
  
  @objc
    func setup(_ clientToken: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) -> Void {
    braintreeClient = BTAPIClient(authorization: clientToken)
        resolver(nil)
  }

  @objc
  func getCardNonce(_ cardNumber: String, expirationMonth: String, expirationYear: String, cvv: String?, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) -> Void {
    guard let braintreeClient = braintreeClient else {
        rejecter("", "Braintree client is not initialized.", nil)
        return
    }

    let cardClient = BTCardClient(apiClient: braintreeClient)
    let card = BTCard()
    card.number = cardNumber
    card.expirationMonth = expirationMonth
    card.expirationYear = expirationYear
    if let cvv = cvv {
        card.cvv = cvv
    }

    cardClient.tokenizeCard(card) { (tokenizedCard, error) in
      guard let tokenizedCard = tokenizedCard else {
        rejecter("", error?.localizedDescription ?? "", error)
        return
      }
        
        
        resolver(tokenizedCard.json)
    }
  }
  
  @objc
  func isVenmoAvailable(_ resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) -> Void {
      guard let braintreeClient = braintreeClient else {
          rejecter("", "Braintree client is not initialized.", nil)
          return
      }

    let venmoDriver = BTVenmoDriver(apiClient: braintreeClient)
    resolver(venmoDriver.isiOSAppAvailableForAppSwitch())
  }
    
    private func convertPaymentMethodUsage(_ paymentMethodUsage: String) -> BTVenmoPaymentMethodUsage {
        if paymentMethodUsage == "multiUse" {
            return .multiUse
        } else if paymentMethodUsage == "singleUse" {
            return .singleUse
        } else {
            return .unspecified
        }
    }
  
  @objc
    func authorizeVenmo(_ vault: Bool, paymentMethodUsage: String?, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) -> Void {
      guard let braintreeClient = braintreeClient else {
          rejecter("", "Braintree client is not initialized.", nil)
          return
      }

    let venmoDriver = BTVenmoDriver(apiClient: braintreeClient)
    let request = BTVenmoRequest()
        request.vault = vault
        
        if let paymentMethodUsage = paymentMethodUsage {
            request.paymentMethodUsage = convertPaymentMethodUsage(paymentMethodUsage)
        }
    
    venmoDriver.tokenizeVenmoAccount(with: request) { (venmoAccount, error) in
        guard let venmoAccount = venmoAccount else {
          rejecter("", error?.localizedDescription ?? "", error)
          return
        }

        resolver([
          "venmoUsername": venmoAccount.username,
          "nonce": venmoAccount.nonce
        ])
    }
  }
  
  @objc
  func isApplePayAvailable(_ supportedNetworks: [String]?, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) -> Void {
      let supportedNetworks = supportedNetworks?.compactMap { PKPaymentNetwork($0) }
    let isAvailable = PKPaymentAuthorizationViewController.canMakePayments(usingNetworks: supportedNetworks ?? [])
    resolver(isAvailable);
  }
    
    private func convertLineItemsFromJSON(_ json: [Any]) throws -> [PKPaymentSummaryItem] {
        let result = try json.map { (item) throws -> PKPaymentSummaryItem in
          guard let itemObject = item as? [String: String], let amountString = itemObject["amount"], let amount = Decimal(string: amountString), let label = itemObject["label"] else {
              throw RNBraintreeSdkError.invalidApplePayLineItems
          }
          
          return PKPaymentSummaryItem(label: label, amount: NSDecimalNumber(decimal: amount))
        }
        
        return result
    }

  @objc
    func authorizeApplePay(_ merchantId: String,
                           lineItems: [Any],
                           contactFields: [String]?,
                           supportedNetworks: [String]?,
                           resolver: @escaping RCTPromiseResolveBlock,
                           rejecter: @escaping RCTPromiseRejectBlock) -> Void {
      guard let braintreeClient = braintreeClient else {
          rejecter("", "Braintree client is not initialized.", nil)
          return
      }

        guard let items = try? convertLineItemsFromJSON(lineItems) else {
            rejecter("", "Invalid Apple Pay line items", nil)
            return
        }

    braintreeApple = BTApplePayClient(apiClient: braintreeClient)
    braintreeApple?.paymentRequest { [weak self] (paymentRequest, error) in
      guard let paymentRequest = paymentRequest else {
        rejecter("", error?.localizedDescription ?? "", error)
        return
      }
      
        if let contactFields = contactFields {
            paymentRequest.requiredBillingContactFields = Set(contactFields.compactMap { PKContactField(rawValue: $0) })
            print(Set(contactFields.map { PKContactField(rawValue: $0) }))
            print(paymentRequest.requiredBillingContactFields)
        }

      paymentRequest.merchantIdentifier = merchantId
            // PKPaymentNetwork
        if let supportedNetworks = supportedNetworks {
            paymentRequest.supportedNetworks = supportedNetworks.compactMap { PKPaymentNetwork($0) }
        }

      paymentRequest.merchantCapabilities = .capability3DS
      paymentRequest.countryCode = "US"; // e.g. US
      paymentRequest.currencyCode = "USD"; // e.g. USD
      paymentRequest.paymentSummaryItems = items
      if let vc = PKPaymentAuthorizationViewController(paymentRequest: paymentRequest) as PKPaymentAuthorizationViewController? {
        vc.delegate = self
        self?.inProgressPromise = (resolver: resolver, rejecter: rejecter)
        let rootVC = UIApplication.shared.delegate?.window??.rootViewController
        rootVC?.present(vc, animated: true, completion: nil)
      } else {
          rejecter("", "Payment Request is invalid", nil)
      }
    }
  }
}

// MARK: - PKPaymentAuthorizationViewControllerDelegate
extension BraintreeSdk: PKPaymentAuthorizationViewControllerDelegate {
  func paymentAuthorizationViewControllerDidFinish(_ controller: PKPaymentAuthorizationViewController) {
    controller.dismiss(animated: true, completion: nil)
  }
  
  func paymentAuthorizationViewController(_ controller: PKPaymentAuthorizationViewController,
                           didAuthorizePayment payment: PKPayment,
                                    handler completion: @escaping (PKPaymentAuthorizationResult) -> Void) {
    braintreeApple?.tokenizeApplePay(payment) { [weak self] (applePayResult, error) in
      guard let inProgressPromise = self?.inProgressPromise else {
        completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
        return
      }
                     
      if let applePayResult = applePayResult {
        inProgressPromise.resolver([
          "nonce": applePayResult.nonce
        ])

        completion(PKPaymentAuthorizationResult(status: .success, errors: nil))
      } else {
        inProgressPromise.rejecter("", error?.localizedDescription ?? "", error)
        completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
      }
    }
  }
}
