package me.neilagarwal.tracklist;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;

import androidx.core.app.NotificationCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.security.Timestamp;


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
    public void updateNotification(String trackTitle, String start) {
        PendingIntent contentIntent = PendingIntent.getActivity(reactContext, 0, new Intent(reactContext, MainActivity.class), PendingIntent.FLAG_CANCEL_CURRENT);

        Notification notification = new NotificationCompat.Builder(reactContext, MediaControllerService.CHANNEL_ID)
                .setContentTitle(trackTitle)
                .setContentText(start)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(contentIntent)
                .setOngoing(true)
                .build();
        NotificationManager notificationManager = (NotificationManager) reactContext.getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.notify(MediaControllerService.SERVICE_NOTIFICATION_ID, notification);
    }
}
