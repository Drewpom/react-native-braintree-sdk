package com.reactnativebraintreesdk;

import androidx.annotation.NonNull;
import android.app.Activity;
import android.content.Intent;
import androidx.fragment.app.FragmentActivity;

import com.google.android.gms.wallet.WalletConstants;
import com.google.android.gms.wallet.TransactionInfo;

import com.facebook.react.module.annotations.ReactModule;
import androidx.appcompat.app.AppCompatActivity;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import java.util.Map;
import java.util.HashMap;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.ActivityEventListener;
import com.braintreepayments.api.*;

@ReactModule(name = BraintreeSdkModule.NAME)
public class BraintreeSdkModule extends ReactContextBaseJavaModule {
    public static final String NAME = "BraintreeSdk";
    private BraintreeClient client;
    private VenmoClient venmoClient;
    private DataCollector dataCollector;
    private GooglePayClient googlePayClient;

    private Promise venmoPromise;
    private Promise googlePayPromise;

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            if (venmoPromise != null) {
                venmoClient.onActivityResult(getCurrentActivity(), resultCode, intent, (venmoAccountNonce, venmoError) -> {
                    if (venmoError != null) {
                        venmoPromise.reject("VenmoError", venmoError.getMessage(), venmoError);
                        return;
                    }

                    dataCollector.collectDeviceData(getCurrentActivity(), (deviceData, dataCollectorError) -> {
                        if (venmoError != null) {
                            venmoPromise.reject("VenmoError", dataCollectorError.getMessage(), dataCollectorError);
                            return;
                        }

                        WritableMap params = Arguments.createMap();
                        // params.putStirng("deviceData", deviceData);
                        params.putString("nonce", venmoAccountNonce.getString());
                        params.putString("venmoUsername", venmoAccountNonce.getUsername());
                        venmoPromise.resolve(params);
                    });
                });
            }

            if (googlePayPromise != null) {
                googlePayClient.onActivityResult(resultCode, intent, (paymentMethodNonce, error) -> {
                    if (error != null) {
                        googlePayPromise.reject("Error", error.getMessage(), error);
                        return;
                    }

                    WritableMap params = Arguments.createMap();
                    params.putString("nonce", paymentMethodNonce.getString());
                    venmoPromise.resolve(params);
                });
            }
        }
    };

    public BraintreeSdkModule(ReactApplicationContext reactContext) {
        super(reactContext);

        reactContext.addActivityEventListener(mActivityEventListener);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void authorizeVenmo(final boolean vault, final String paymentMethodUsage, final Promise promise) {
        venmoPromise = promise;

        VenmoRequest request = new VenmoRequest(paymentMethodUsage == "multiUse" ? VenmoPaymentMethodUsage.MULTI_USE : VenmoPaymentMethodUsage.SINGLE_USE);
        request.setShouldVault(vault);

        FragmentActivity activity = (FragmentActivity)getCurrentActivity();
        venmoClient.tokenizeVenmoAccount(activity, request, (error) -> {
            if (error != null) {
                promise.reject("Error", error.getMessage(), error);
            }
        });
    }

    @ReactMethod
    public void isGooglePayAvailable(final Promise promise) {
        FragmentActivity activity = (FragmentActivity)getCurrentActivity();
        googlePayClient.isReadyToPay(activity, (isReadyToPay, error) -> {
            if (error != null) {
                promise.reject("Error", error.getMessage(), error);
                return;
            }

            promise.resolve(isReadyToPay);
        });
    }

    @ReactMethod
    public void authorizeGooglePay(final String price, final boolean billingAddressRequired, final Promise promise) {
        GooglePayRequest googlePayRequest = new GooglePayRequest();
        googlePayRequest.setTransactionInfo(TransactionInfo.newBuilder()
            .setTotalPrice(price)
            .setTotalPriceStatus(WalletConstants.TOTAL_PRICE_STATUS_FINAL)
            .setCurrencyCode("USD")
            .build());

        googlePayRequest.setBillingAddressRequired(billingAddressRequired);
        googlePayPromise = promise;

        FragmentActivity activity = (FragmentActivity)getCurrentActivity();
        googlePayClient.requestPayment(activity, googlePayRequest, (error) -> {
            if (error != null) {
                promise.reject("Error", error.getMessage(), error);
            }
        });
    }

    @ReactMethod
    public void setup(final String clientToken, final Promise promise) {
        AppCompatActivity act = (AppCompatActivity) getCurrentActivity();
        client = new BraintreeClient(act, clientToken);
        venmoClient = new VenmoClient(client);
        dataCollector = new DataCollector(client);
        googlePayClient = new GooglePayClient(client);

        promise.resolve(true);
    }

    @ReactMethod
    public void getCardNonce(final String cardNumber, final String expirationMonth, final String expirationYear, final String cvv, final Promise promise) {
        Card card = new Card();
        card.setNumber(cardNumber);
        card.setExpirationMonth(expirationMonth);
        card.setExpirationYear(expirationYear);
        if (cvv != null) {
            card.setCvv(cvv);
        }

        CardClient cardClient = new CardClient(this.client);
        cardClient.tokenize(card, (cardNonce, error) -> {
        if (cardNonce != null) {
            WritableMap params = Arguments.createMap();
            params.putString("nonce", cardNonce.getString());
            params.putString("cardNetwork", cardNonce.getCardType());
            params.putString("expirationMonth", cardNonce.getExpirationMonth());
            params.putString("expirationYear", cardNonce.getExpirationYear());
            params.putString("cardholderName", cardNonce.getCardholderName());
            params.putString("lastTwo", cardNonce.getLastTwo());
            params.putString("lastFour", cardNonce.getLastFour());
            params.putString("bin", cardNonce.getBin());
            promise.resolve(params);
        } else {
            promise.reject("Error", error.getMessage());
        }
        });
    }
}
