package me.neilagarwal.tracklist;

import android.annotation.SuppressLint;
import android.os.Build;
import android.service.notification.NotificationListenerService;

import androidx.annotation.RequiresApi;

@RequiresApi(api = Build.VERSION_CODES.JELLY_BEAN_MR2)
@SuppressLint("OverrideAbstract")
public class NotificationListener extends NotificationListenerService {
    public NotificationListener() {

    }
}
