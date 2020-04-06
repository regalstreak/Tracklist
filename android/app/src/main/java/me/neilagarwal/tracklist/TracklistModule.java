package me.neilagarwal.tracklist;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.text.Spanned;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.text.HtmlCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.security.Timestamp;
import java.util.HashMap;
import java.util.Map;


public class TracklistModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private static Intent mediaControllerServiceIntent;

    TracklistModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        mediaControllerServiceIntent = new Intent(reactContext, MediaControllerService.class);
    }

    @Override
    public String getName() {
        return "Tracklist";
    }

    @ReactMethod
    public void startService() {
        reactContext.startService(mediaControllerServiceIntent);
    }

    @ReactMethod
    public void stopService() {
        reactContext.stopService(mediaControllerServiceIntent);
    }

    @ReactMethod
    public void updateNotification(ReadableMap payload) {

        Map current = getTrackHashMap(payload.getMap("currentTrack"));
        Map previous = getTrackHashMap(payload.getMap("previousTrack"));
        Map next = getTrackHashMap(payload.getMap("nextTrack"));


        PendingIntent contentIntent = PendingIntent.getActivity(reactContext, 0, new Intent(reactContext, MainActivity.class), PendingIntent.FLAG_CANCEL_CURRENT);

        Notification notification = new NotificationCompat.Builder(reactContext, MediaControllerService.CHANNEL_ID)
                .setContentTitle(getNotificationContentMap(current, previous, next).get("title"))
                .setContentText((CharSequence) current.get("start"))
                .setStyle(new NotificationCompat.BigTextStyle()
                        .bigText(getNotificationContentMap(current, previous, next).get("text"))
                        .setSummaryText(current.get("start") + " (" + payload.getInt("index") + ")")
                )
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(contentIntent)
                .setOngoing(true)
                .build();

        NotificationManager notificationManager = (NotificationManager) reactContext.getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.notify(MediaControllerService.SERVICE_NOTIFICATION_ID, notification);
    }

    private String getReadableMapString(ReadableMap readableMap, String key) {
        if (readableMap != null && readableMap.hasKey(key)) {
            return readableMap.getString(key);
        } else {
            return "";
        }
    }

    private Map getTrackHashMap(ReadableMap readableMap) {
        if (readableMap == null) {
            return null;
        } else {
            Map<String, String> hashMap = new HashMap<>();
            String[] keys = new String[]{"start", "title"};
            for (String key : keys) {
                hashMap.put(key, getReadableMapString(readableMap, key));
            }
            return hashMap;
        }
    }

    private Map<String, Spanned> getNotificationContentMap(Map current, Map previous, Map next) {
        Map<String, Spanned> notificationContentMap = new HashMap<>();

        Spanned text;
        Spanned title;

        if (current != null) {
            title = HtmlCompat.fromHtml((String) current.get("title"), HtmlCompat.FROM_HTML_MODE_LEGACY);

            if (previous == null && next != null) {
                // first
                text = HtmlCompat.fromHtml("<font color=\"#385CFF\"><b>Next</b></font>: <font color=\"#ff0000\">" + next.get("start") + "</font> | " + next.get("title"), HtmlCompat.FROM_HTML_MODE_LEGACY);

            } else if (previous != null && next == null) {
                // last
                text = HtmlCompat.fromHtml("<font color=\"#385CFF\"><b>Previous</b></font>: <font color=\"#ff0000\">" + previous.get("start") + "</font> | " + previous.get("title"), HtmlCompat.FROM_HTML_MODE_LEGACY);

            } else if (previous != null & next != null) {
                // both
                text = HtmlCompat.fromHtml("<font color=\"#385CFF\"><b>Previous</b></font>: <font color=\"#ff0000\">" + previous.get("start") + "</font> | " + previous.get("title") + "<br>"
                        + "<font color=\"#385CFF\"><b>Next</b></font>: <font color=\"#ff0000\">" + next.get("start") + "</font> | " + next.get("title"), HtmlCompat.FROM_HTML_MODE_LEGACY);
            } else {
                // error
                title = HtmlCompat.fromHtml("Error getting notification title", HtmlCompat.FROM_HTML_MODE_LEGACY);
                text = HtmlCompat.fromHtml("Please contact developer for help", HtmlCompat.FROM_HTML_MODE_LEGACY);
            }
        } else {
            // error
            title = HtmlCompat.fromHtml("Error getting notification title", HtmlCompat.FROM_HTML_MODE_LEGACY);
            text = HtmlCompat.fromHtml("Please contact developer for help", HtmlCompat.FROM_HTML_MODE_LEGACY);
        }

        notificationContentMap.put("title", title);
        notificationContentMap.put("text", text);

        return notificationContentMap;
    }

}
