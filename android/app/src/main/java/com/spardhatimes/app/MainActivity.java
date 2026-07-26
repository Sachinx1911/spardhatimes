package com.spardhatimes.app;

import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Android's default back behaviour for a WebView shell is to finish the
        // activity, so a single back press from anywhere quits the app. That is
        // unacceptable here: a student mid-test would be thrown out of the exam.
        // Walk the WebView's own history instead, and only exit once there is
        // nothing left to go back to.
        //
        // Registered on OnBackPressedDispatcher rather than by overriding
        // onBackPressed(), because this app targets SDK 36 where the predictive
        // back gesture is active and the legacy override is not invoked.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (getBridge() != null && getBridge().getWebView().canGoBack()) {
                    getBridge().getWebView().goBack();
                } else {
                    finish();
                }
            }
        });
    }
}
