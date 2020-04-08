package me.neilagarwal.tracklist;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.provider.Settings;
import android.text.Spanned;
import android.widget.Toast;

import androidx.core.app.NotificationCompat;
import androidx.core.text.HtmlCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.util.HashMap;
import java.util.Map;


public class TracklistModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private static Intent mediaControllerServiceIntent;
    private boolean isSpotifyInstalled;

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
        PackageManager pm = reactContext.getPackageManager();

        try {
            pm.getPackageInfo("com.spotify.music", 0);
            isSpotifyInstalled = true;
        } catch (PackageManager.NameNotFoundException e) {
            isSpotifyInstalled = false;
        }

        if (notificationAccessPermission()) {
            reactContext.startService(mediaControllerServiceIntent);
        } else {
            Intent notificationListenerSettingsIntent = new
                    Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
            notificationListenerSettingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(notificationListenerSettingsIntent);
            Toast.makeText(reactContext, "Notification access required for getting current media playing and position", Toast.LENGTH_LONG).show();
        }
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

        Notification notification;

        PendingIntent contentIntent = PendingIntent.getActivity(reactContext, 0, new Intent(reactContext, MainActivity.class), PendingIntent.FLAG_CANCEL_CURRENT);


        if (current == null && previous == null) {
            notification = new NotificationCompat.Builder(reactContext, MediaControllerService.CHANNEL_ID)
                    .setContentTitle("Tracklist")
                    .setContentText("Service started")
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setContentIntent(contentIntent)
                    .setOngoing(true)
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setColor(Color.parseColor("#385CFF"))
                    .build();
        } else if (current != null && previous != null) {
            notification = new NotificationCompat.Builder(reactContext, MediaControllerService.CHANNEL_ID)
                    .setContentTitle(getNotificationContentMap(current, previous, next).get("title"))
                    .setContentText((CharSequence) current.get("start"))
                    .setStyle(new NotificationCompat.BigTextStyle()
                            .bigText(getNotificationContentMap(current, previous, next).get("text"))
                            .setSummaryText(current.get("start") + " [" + payload.getInt("index") + "]")
                    )
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setContentIntent(contentIntent)
                    .setOngoing(true)
                    .addAction(getAction("Spotify (Current)", (String) current.get("title")))
                    .addAction(getAction("Spotify (Previous)", (String) previous.get("title")))
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setColor(Color.parseColor("#385CFF"))
                    .build();
        } else {
            notification = new NotificationCompat.Builder(reactContext, MediaControllerService.CHANNEL_ID)
                    .setContentTitle(getNotificationContentMap(current, previous, next).get("title"))
                    .setContentText((CharSequence) current.get("start"))
                    .setStyle(new NotificationCompat.BigTextStyle()
                            .bigText(getNotificationContentMap(current, previous, next).get("text"))
                            .setSummaryText(current.get("start") + " [" + payload.getInt("index") + "]")
                    )
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setContentIntent(contentIntent)
                    .setOngoing(true)
                    .addAction(getAction("Spotify", (String) current.get("title")))
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setColor(Color.parseColor("#385CFF"))
                    .build();
        }

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

        final String nextTextString = "<b><font color=\"#385CFF\">Next</font>: </b>";
        final String previousTextString = "<b><font color=\"#385CFF\">Previous</font>: </b>";
        final String startString1 = "<font color=\"#262832\">";
        final String startString2 = "</font> <b>|</b> ";

        final String errorTitleString = "Error getting notification title";
        final String errorTextString = "Please contact developer for help";

        if (current != null) {
            String[] currentTitleSplit = current.get("title").toString().split("-");
            String artist = currentTitleSplit[0];
            String track = currentTitleSplit.length > 1 ? currentTitleSplit[1] : current.get("title").toString();

            title = HtmlCompat.fromHtml("<b>" + artist + "</b>-" + track, HtmlCompat.FROM_HTML_MODE_LEGACY);

            if (previous == null && next != null) {
                // first
                text = HtmlCompat.fromHtml(nextTextString + startString1 + next.get("start") + startString2 + next.get("title"), HtmlCompat.FROM_HTML_MODE_LEGACY);

            } else if (previous != null && next == null) {
                // last
                text = HtmlCompat.fromHtml(previousTextString + startString1 + previous.get("start") + startString2 + previous.get("title"), HtmlCompat.FROM_HTML_MODE_LEGACY);

            } else if (previous != null & next != null) {
                // both
                text = HtmlCompat.fromHtml(previousTextString + startString1 + previous.get("start") + startString2 + previous.get("title") + "<br>"
                        + nextTextString + startString1 + next.get("start") + startString2 + next.get("title"), HtmlCompat.FROM_HTML_MODE_LEGACY);
            } else {
                // error
                title = HtmlCompat.fromHtml(errorTitleString, HtmlCompat.FROM_HTML_MODE_LEGACY);
                text = HtmlCompat.fromHtml(errorTextString, HtmlCompat.FROM_HTML_MODE_LEGACY);
            }
        } else {
            // error
            title = HtmlCompat.fromHtml(errorTitleString, HtmlCompat.FROM_HTML_MODE_LEGACY);
            text = HtmlCompat.fromHtml(errorTextString, HtmlCompat.FROM_HTML_MODE_LEGACY);
        }

        notificationContentMap.put("title", title);
        notificationContentMap.put("text", text);

        return notificationContentMap;
    }

    private NotificationCompat.Action getAction(String actionTitle, String search) {
        if (!search.isEmpty()) {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            PendingIntent pendingIntent;

            String searchFiltered = search.replaceAll("ft\\.", "");
            searchFiltered = searchFiltered.replaceAll("\\p{P}", "");

            if (isSpotifyInstalled) {
                intent.setData(Uri.parse("spotify:search:" + searchFiltered));
                intent.putExtra(Intent.EXTRA_REFERRER,
                        Uri.parse("android-app://" + reactContext.getPackageName()));

                pendingIntent = PendingIntent.getActivity(reactContext, 0, intent, PendingIntent.FLAG_CANCEL_CURRENT);

            } else {
                intent.setData(Uri.parse("https://play.google.com/store/apps/details?id=com.spotify.music"));
                pendingIntent = PendingIntent.getActivity(reactContext, 0, intent, PendingIntent.FLAG_ONE_SHOT);
            }
            return new NotificationCompat.Action(0, actionTitle, pendingIntent);
        } else {
            return null;
        }
    }

    private boolean notificationAccessPermission() {
        if (Settings.Secure.getString(reactContext.getContentResolver(), "enabled_notification_listeners").contains(reactContext.getApplicationContext().getPackageName())) {
            return true;
        } else {
            return false;
        }
    }

}
