package me.neilagarwal.tracklist;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.media.MediaMetadata;
import android.media.session.MediaController;
import android.media.session.MediaSession;
import android.media.session.MediaSessionManager;
import android.os.Build;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.List;
import java.util.Map;
import java.util.HashMap;


public class MediaControllerModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    MediaControllerModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "MediaController";
    }

    @ReactMethod
    public void getTitle(Promise promise) {

        try {
            MediaSessionManager mm = (MediaSessionManager) reactContext.getSystemService(Context.MEDIA_SESSION_SERVICE);
            List<MediaController> controller = mm.getActiveSessions(new ComponentName(reactContext, NotificationListener.class));

            MediaController first = controller.get(0);

            Log.i("Tracklist", "found controllers " + controller.size());
            Log.i("Tracklist", "title " + first.getMetadata().getString(MediaMetadata.METADATA_KEY_TITLE));
            Log.i("Tracklist", "progress " + convertToMinutes(first.getPlaybackState().getPosition()));

            Toast.makeText(getReactApplicationContext(), convertToMinutes(first.getPlaybackState().getPosition()), Toast.LENGTH_SHORT).show();

            promise.resolve(first.getMetadata().getString(MediaMetadata.METADATA_KEY_TITLE));

        } catch (Exception e) {
            promise.reject("Exception", e);
        }
    }

    @ReactMethod
    public void startService() {
        reactContext.startService(new Intent(reactContext, MediaControllerService.class));
    }

    private MediaController getFirstMediaController(Context context) {
        MediaSessionManager mediaSessionManager = (MediaSessionManager)context.getSystemService(Context.MEDIA_SESSION_SERVICE);
        List<MediaController> controller = mediaSessionManager.getActiveSessions((new ComponentName(context, NotificationListener.class)));
        MediaController firstController = controller.get(0);
        return firstController;
    }

    public String getDuration(Context context) {
        return convertToMinutes(getFirstMediaController(context).getPlaybackState().getPosition());
    }

    public String getTitle(Context context) {
        return getFirstMediaController(context).getMetadata().getString(MediaMetadata.METADATA_KEY_TITLE);
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
