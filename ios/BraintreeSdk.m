#import <React/RCTBridgeModule.h>
#import <PassKit/PassKit.h>

@interface RCT_EXTERN_MODULE(BraintreeSdk, NSObject)

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

RCT_EXTERN_METHOD(setup:(NSString *)clientToken
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getCardNonce:(NSString *)cardNumber
                  expirationMonth: (NSString *)expirationMonth
                  expirationYear: (NSString *)expirationYear
                  cvv: (NSString *)cvv
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject
                  )

RCT_EXTERN_METHOD(isVenmoAvailable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isApplePayAvailable:(NSArray<NSString *>*)supportedNetworks
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(authorizeApplePay:(NSString *)merchantId
                  lineItems: (NSArray<NSDictionary *>*)lineItems
                  contactFields: (NSArray<NSString *>*)contactFields
                  supportedNetworks: (NSArray<NSString *>*)supportedNetworks
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(authorizeVenmo:(BOOL)vault
                  paymentMethodUsage: (NSString* )paymentMethodUsage
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
