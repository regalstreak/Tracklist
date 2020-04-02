package me.neilagarwal.tracklist;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.media.MediaMetadata;
import android.media.session.MediaController;
import android.media.session.MediaSessionManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.List;

public class MediaControllerService extends Service {
    private Handler handler = new Handler();
    private static final int SERVICE_NOTIFICATION_ID = 12345;
    private static final String CHANNEL_ID = "MediaController";


    private Runnable runnableCode = new Runnable() {
        @Override
        public void run() {
            MainApplication application = (MainApplication) getApplication();
            ReactNativeHost reactNativeHost = application.getReactNativeHost();
            ReactInstanceManager reactInstanceManager = reactNativeHost.getReactInstanceManager();
            ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

            WritableMap data = Arguments.createMap();
            data.putString("mediaTitle", getTitle(reactContext));
            data.putString("mediaPosition", getPosition(reactContext));

            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("MediaControllerService", data);
            handler.postDelayed(this, 2000);
        }
    };

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        this.handler.post(this.runnableCode);

        // Turn to foreground service
        createNotificationChannel();
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Media Controller service")
                .setContentText("Running…")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(contentIntent)
                .setOngoing(true)
                .build();
        startForeground(SERVICE_NOTIFICATION_ID, notification);
        return START_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        this.handler.removeCallbacks(runnableCode);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "MediaController", importance);
            channel.setDescription("CHANNEL DESCRIPTION");
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    public String getPosition(Context context) {
        return convertToMinutes(getFirstMediaController(context).getPlaybackState().getPosition());
    }

    public String getTitle(Context context) {
        return getFirstMediaController(context).getMetadata().getString(MediaMetadata.METADATA_KEY_TITLE);
    }

    private MediaController getFirstMediaController(Context context) {
        MediaSessionManager mediaSessionManager = (MediaSessionManager) context.getSystemService(Context.MEDIA_SESSION_SERVICE);
        List<MediaController> controller = mediaSessionManager.getActiveSessions((new ComponentName(context, NotificationListener.class)));
        MediaController firstController = controller.get(0);
        return firstController;
    }

    private String convertToMinutes(long ms) {
        long minutes = (ms / 1000) / 60;
        long seconds = ((ms / 1000) % 60);
        return prefixZero(minutes) + ':' + prefixZero(seconds);
    }

    private String prefixZero(long val) {
        if (val >= 0 && val < 10) {
            return '0' + Long.toString(val);
        } else {
            return Long.toString(val);
        }
    }
}
