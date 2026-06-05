export interface CodeFile {
  id: string;
  name: string;
  language: 'kotlin' | 'xml' | 'gradle';
  path: string;
  description: string;
  code: string;
}

export const codeFiles: CodeFile[] = [
  {
    id: 'main-activity',
    name: 'MainActivity.kt',
    language: 'kotlin',
    path: 'app/src/main/java/com/gaiaalarm/MainActivity.kt',
    description:
      'Main activity with TimePicker, alarm scheduling, vibration toggle, Yandex Mobile Ads banner, and runtime permission handling.',
    code: `package com.gaiaalarm

import android.Manifest
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import com.gaiaalarm.databinding.ActivityMainBinding
import com.yandex.mobile.ads.banner.AdSize
import com.yandex.mobile.ads.banner.BannerAdView
import com.yandex.mobile.ads.common.AdRequest

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var viewModel: AlarmViewModel
    private var bannerAd: BannerAdView? = null

    // ActivityResultLauncher for requesting runtime permissions.
    // SCHEDULE_EXACT_ALARM (API 31+) and POST_NOTIFICATIONS (API 33+)
    // are required for precise alarm scheduling and full-screen notifications.
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.entries.all { it.value }
        if (allGranted) {
            Toast.makeText(this, "Permissions granted", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(this, "Some permissions denied", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this)[AlarmViewModel::class.java]

        // Observe alarm state from ViewModel
        viewModel.isAlarmEnabled.observe(this) { enabled ->
            binding.switchVibration.isEnabled = enabled
        }

        // "Set Alarm" button schedules the alarm via AlarmManager
        binding.btnSetAlarm.setOnClickListener {
            val hour = binding.timePicker.hour
            val minute = binding.timePicker.minute
            val label = binding.etLabel.text.toString().ifEmpty { "Alarm" }
            val vibrate = binding.switchVibration.isChecked
            viewModel.setAlarm(hour, minute, label, vibrate)
            scheduleAlarm(hour, minute)
            Toast.makeText(this, "Alarm set: \\$hour:\\$minute", Toast.LENGTH_SHORT).show()
        }

        // "Cancel Alarm" button cancels the scheduled alarm
        binding.btnCancelAlarm.setOnClickListener {
            viewModel.cancelAlarm()
            cancelScheduledAlarm()
            Toast.makeText(this, "Alarm cancelled", Toast.LENGTH_SHORT).show()
        }

        // Request necessary runtime permissions
        requestAlarmPermissions()

        // Initialize and load Yandex Mobile Ads banner
        initYandexBanner()
    }

    /**
     * Schedules the alarm using AlarmManager with setExactAndAllowWhileIdle().
     * This ensures the alarm fires even in Doze mode (API 23+).
     */
    private fun scheduleAlarm(hour: Int, minute: Int) {
        val alarmManager = getSystemService(ALARM_SERVICE) as AlarmManager
        val intent = Intent(this, AlarmReceiver::class.java).apply {
            action = AlarmReceiver.ACTION_ALARM_TRIGGER
        }
        val pendingIntent = PendingIntent.getBroadcast(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val calendar = java.util.Calendar.getInstance().apply {
            set(java.util.Calendar.HOUR_OF_DAY, hour)
            set(java.util.Calendar.MINUTE, minute)
            set(java.util.Calendar.SECOND, 0)
            if (before(java.util.Calendar.getInstance())) {
                add(java.util.Calendar.DAY_OF_MONTH, 1) // tomorrow
            }
        }

        // setExactAndAllowWhileIdle ensures exact timing even in Doze mode
        alarmManager.setExactAndAllowWhileIdle(
            AlarmManager.RTC_WAKEUP,
            calendar.timeInMillis,
            pendingIntent
        )
    }

    /**
     * Cancels the pending alarm via the same PendingIntent.
     */
    private fun cancelScheduledAlarm() {
        val alarmManager = getSystemService(ALARM_SERVICE) as AlarmManager
        val intent = Intent(this, AlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager.cancel(pendingIntent)
    }

    /**
     * Initializes Yandex Mobile Ads banner view and loads the ad.
     * The banner is placed at the bottom of activity_main.xml.
     */
    private fun initYandexBanner() {
        bannerAd = binding.bannerAd
        bannerAd?.setAdUnitId(AdIds.BANNER_UNIT_ID)
        bannerAd?.setAdSize(AdSize.BANNER_320x50)

        val adRequest = AdRequest.Builder().build()
        bannerAd?.loadAd(adRequest)

        // Set up callback listeners for ad loading events
        bannerAd?.setAdEventListener(object : AdEventListener() {
            override fun onAdLoaded() {
                bannerAd?.visibility = android.view.View.VISIBLE
            }
            override fun onAdFailedToLoad(error: com.yandex.mobile.ads.common.AdRequestError) {
                // Hide banner on failure — no placeholder, ad-free experience when no fill
                bannerAd?.visibility = android.view.View.GONE
            }
        })
    }

    /**
     * Requests SCHEDULE_EXACT_ALARM and POST_NOTIFICATIONS at runtime.
     */
    private fun requestAlarmPermissions() {
        val permissions = mutableListOf<String>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            permissions.add(Manifest.permission.SCHEDULE_EXACT_ALARM)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        if (permissions.isNotEmpty()) {
            permissionLauncher.launch(permissions.toTypedArray())
        }
    }
}

/**
 * Placeholder extension using Yandex SDK AdEventListener pattern.
 */
abstract class AdEventListener : com.yandex.mobile.ads.common.AdEventListener() {
    override fun onAdClicked() {}
    override fun onAdLeftApplication() {}
    override fun onReturnedToApplication() {}
}
`,
  },
  {
    id: 'viewmodel',
    name: 'AlarmViewModel.kt',
    language: 'kotlin',
    path: 'app/src/main/java/com/gaiaalarm/AlarmViewModel.kt',
    description:
      'MVVM ViewModel that exposes alarm state via LiveData. Stores alarm time, label, and vibration preference in SharedPreferences.',
    code: `package com.gaiaalarm

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData

/**
 * ViewModel for the alarm feature.
 * Exposes alarm state via LiveData so the UI can observe and react.
 *
 * Architecture: MVVM
 * The ViewModel holds data across configuration changes and is
 * lifecycle-aware. Data persistence is handled via SharedPreferences
 * (could be replaced with DataStore for more flexibility).
 */
class AlarmViewModel(application: Application) : AndroidViewModel(application) {

    private val prefs = application.getSharedPreferences("gaia_alarm_prefs", 0)

    private val _hour = MutableLiveData<Int>(prefs.getInt("hour", 7))
    val hour: LiveData<Int> = _hour

    private val _minute = MutableLiveData<Int>(prefs.getInt("minute", 30))
    val minute: LiveData<Int> = _minute

    private val _label = MutableLiveData<String>(prefs.getString("label", "Wake up!") ?: "Wake up!")
    val label: LiveData<String> = _label

    private val _vibrate = MutableLiveData<Boolean>(prefs.getBoolean("vibrate", true))
    val vibrate: LiveData<Boolean> = _vibrate

    private val _isAlarmEnabled = MutableLiveData<Boolean>(prefs.getBoolean("enabled", false))
    val isAlarmEnabled: LiveData<Boolean> = _isAlarmEnabled

    /**
     * Persists the alarm settings and updates the enabled state.
     */
    fun setAlarm(hour: Int, minute: Int, label: String, vibrate: Boolean) {
        prefs.edit().apply {
            putInt("hour", hour)
            putInt("minute", minute)
            putString("label", label)
            putBoolean("vibrate", vibrate)
            putBoolean("enabled", true)
        }.apply()

        _hour.value = hour
        _minute.value = minute
        _label.value = label
        _vibrate.value = vibrate
        _isAlarmEnabled.value = true
    }

    /**
     * Marks the alarm as disabled in persistence.
     */
    fun cancelAlarm() {
        prefs.edit().putBoolean("enabled", false).apply()
        _isAlarmEnabled.value = false
    }

    /**
     * Updates the vibration preference in real-time.
     */
    fun setVibrate(enabled: Boolean) {
        prefs.edit().putBoolean("vibrate", enabled).apply()
        _vibrate.value = enabled
    }

    /**
     * Updates the alarm label text.
     */
    fun setLabel(text: String) {
        prefs.edit().putString("label", text).apply()
        _label.value = text
    }
}
`,
  },
  {
    id: 'alarm-receiver',
    name: 'AlarmReceiver.kt',
    language: 'kotlin',
    path: 'app/src/main/java/com/gaiaalarm/AlarmReceiver.kt',
    description:
      'BroadcastReceiver triggered by AlarmManager. Plays the alarm sound, shows a full-screen notification, vibrates if enabled, and reschedules for the next day.',
    code: `package com.gaiaalarm

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat

/**
 * Handles the alarm trigger from AlarmManager.
 *
 * When the alarm fires:
 * 1. Reads alarm settings from SharedPreferences
 * 2. Plays the default alarm ringtone
 * 3. Vibrates if enabled
 * 4. Shows a full-screen notification with a "Dismiss" action
 * 5. Reschedules for the next day (daily repeat)
 */
class AlarmReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_ALARM_TRIGGER = "com.gaiaalarm.ALARM_TRIGGER"
        const val ACTION_DISMISS = "com.gaiaalarm.DISMISS"
        const val NOTIFICATION_ID = 1001
        const val CHANNEL_ID = "gaia_alarm_channel"

        private var ringtone: Ringtone? = null

        /** Dismiss the ringing alarm and stop the ringtone. */
        fun dismissAlarm(context: Context) {
            ringtone?.stop()
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.cancel(NOTIFICATION_ID)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            ACTION_ALARM_TRIGGER -> handleAlarmTrigger(context)
            ACTION_DISMISS -> dismissAlarm(context)
        }
    }

    /**
     * Handles the alarm trigger: plays sound, vibrates, shows notification.
     */
    private fun handleAlarmTrigger(context: Context) {
        val prefs = context.getSharedPreferences("gaia_alarm_prefs", 0)
        val vibrate = prefs.getBoolean("vibrate", true)
        val label = prefs.getString("label", "Alarm") ?: "Alarm"

        // Play the default alarm ringtone
        val ringtoneUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        ringtone = RingtoneManager.getRingtone(context, ringtoneUri).apply {
            play()
        }

        // Vibrate if enabled
        if (vibrate) {
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vm.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }

            val pattern = longArrayOf(0, 500, 200, 500, 200, 500)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0))
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(pattern, 0)
            }
        }

        // Show full-screen notification with Dismiss button
        showFullScreenNotification(context, label)

        // Reschedule alarm for tomorrow (daily repeat)
        rescheduleAlarm(context)
    }

    /**
     * Creates a full-screen notification for the alarm.
     * On Android 10+ this can display even on the lock screen.
     */
    private fun showFullScreenNotification(context: Context, label: String) {
        val notificationManager = context.getSystemService(
            Context.NOTIFICATION_SERVICE
        ) as NotificationManager

        // Create notification channel (required for API 26+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID, "Alarm Channel",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Full-screen alarm notifications"
            }
            notificationManager.createNotificationChannel(channel)
        }

        // PendingIntent for the Dismiss action
        val dismissIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = ACTION_DISMISS
        }
        val dismissPendingIntent = PendingIntent.getBroadcast(
            context, 1, dismissIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_alarm)
            .setContentTitle("GaiaAlarm — \\$label")
            .setContentText("Time to wake up!")
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setFullScreenIntent(
                PendingIntent.getActivity(
                    context, 0, Intent(),
                    PendingIntent.FLAG_IMMUTABLE
                ), true
            )
            .setAutoCancel(false)
            .setOngoing(true)
            .addAction(
                R.drawable.ic_close, "Dismiss",
                dismissPendingIntent
            )
            .build()

        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    /**
     * Reschedules the alarm for the next day using AlarmManager.
     */
    private fun rescheduleAlarm(context: Context) {
        val prefs = context.getSharedPreferences("gaia_alarm_prefs", 0)
        val hour = prefs.getInt("hour", 7)
        val minute = prefs.getInt("minute", 30)

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = ACTION_ALARM_TRIGGER
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val calendar = java.util.Calendar.getInstance().apply {
            add(java.util.Calendar.DAY_OF_MONTH, 1)
            set(java.util.Calendar.HOUR_OF_DAY, hour)
            set(java.util.Calendar.MINUTE, minute)
            set(java.util.Calendar.SECOND, 0)
        }

        alarmManager.setExactAndAllowWhileIdle(
            android.app.AlarmManager.RTC_WAKEUP,
            calendar.timeInMillis,
            pendingIntent
        )
    }
}
`,
  },
  {
    id: 'boot-receiver',
    name: 'BootReceiver.kt',
    language: 'kotlin',
    path: 'app/src/main/java/com/gaiaalarm/BootReceiver.kt',
    description:
      'BroadcastReceiver that restores the alarm schedule after the device reboots. The BOOT_COMPLETED intent is declared in the manifest.',
    code: `package com.gaiaalarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import java.util.Calendar

/**
 * Restores the alarm schedule after device reboot.
 * AlarmManager alarms are cleared on reboot, so we must
 * re-register any active alarm from SharedPreferences.
 */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return

        val prefs = context.getSharedPreferences("gaia_alarm_prefs", 0)
        val enabled = prefs.getBoolean("enabled", false)
        if (!enabled) return

        val hour = prefs.getInt("hour", 7)
        val minute = prefs.getInt("minute", 30)

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val alarmIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = AlarmReceiver.ACTION_ALARM_TRIGGER
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context, 0, alarmIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            if (before(Calendar.getInstance())) {
                add(Calendar.DAY_OF_MONTH, 1)
            }
        }

        alarmManager.setExactAndAllowWhileIdle(
            AlarmManager.RTC_WAKEUP,
            calendar.timeInMillis,
            pendingIntent
        )
    }
}
`,
  },
  {
    id: 'widget-provider',
    name: 'MyWidgetProvider.kt',
    language: 'kotlin',
    path: 'app/src/main/java/com/gaiaalarm/MyWidgetProvider.kt',
    description:
      'AppWidgetProvider for the home screen widget. Displays current time, next alarm, label, and a Snooze button. NO advertising content.',
    code: `package com.gaiaalarm

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.text.format.DateFormat
import android.widget.RemoteViews
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

/**
 * Home screen widget provider for GaiaAlarm.
 *
 * Widget UI (no ads — ads only appear in MainActivity):
 * - Current time (updates every minute)
 * - Next alarm time or "Alarm not set"
 * - Alarm label
 * - Snooze button (postpones alarm by 10 minutes)
 *
 * Tap on widget opens MainActivity.
 * Widget uses RemoteViews for compatibility with API 23+.
 */
class MyWidgetProvider : AppWidgetProvider() {

    companion object {
        const val ACTION_SNOOZE = "com.gaiaalarm.widget.SNOOZE"
        const val ACTION_TIME_TICK = "android.intent.action.TIME_TICK"

        /** Utility to update all widget instances with current data. */
        fun updateAllWidgets(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val component = ComponentName(context, MyWidgetProvider::class.java)
            val ids = manager.getAppWidgetIds(component)
            ids.forEach { id ->
                manager.updateAppWidget(id, buildRemoteViews(context))
            }
        }

        /** Builds the RemoteViews layout for the widget. */
        private fun buildRemoteViews(context: Context): RemoteViews {
            val views = RemoteViews(context.packageName, R.layout.widget_layout)
            val prefs = context.getSharedPreferences("gaia_alarm_prefs", 0)

            // Current time — updates on each TIME_TICK broadcast
            val now = Calendar.getInstance()
            val is24Hour = DateFormat.is24HourFormat(context)
            val timeFormat = if (is24Hour) "HH:mm" else "hh:mm a"
            val sdf = SimpleDateFormat(timeFormat, Locale.getDefault())
            views.setTextViewText(R.id.widget_current_time, sdf.format(now.time))

            // Alarm status
            val enabled = prefs.getBoolean("enabled", false)
            if (enabled) {
                val hour = prefs.getInt("hour", 7)
                val minute = prefs.getInt("minute", 30)
                val label = prefs.getString("label", "Wake up!") ?: "Wake up!"
                views.setTextViewText(
                    R.id.widget_next_alarm,
                    String.format(Locale.getDefault(), "Next alarm: %02d:%02d", hour, minute)
                )
                views.setTextViewText(R.id.widget_label, label)
            } else {
                views.setTextViewText(R.id.widget_next_alarm, "Alarm not set")
                views.setTextViewText(R.id.widget_label, "Tap to set alarm")
            }

            // Tap widget → open MainActivity
            val mainIntent = Intent(context, MainActivity::class.java)
            val mainPendingIntent = PendingIntent.getActivity(
                context, 0, mainIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_root, mainPendingIntent)

            // Snooze button → postpones alarm by 10 minutes
            val snoozeIntent = Intent(context, MyWidgetProvider::class.java).apply {
                action = ACTION_SNOOZE
            }
            val snoozePendingIntent = PendingIntent.getBroadcast(
                context, 2, snoozeIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_snooze, snoozePendingIntent)

            return views
        }
    }

    override fun onUpdate(
        context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { id ->
            appWidgetManager.updateAppWidget(id, buildRemoteViews(context))
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        when (intent.action) {
            ACTION_SNOOZE -> handleSnooze(context)
            ACTION_TIME_TICK -> updateAllWidgets(context)
        }
    }

    /**
     * Snooze action: reschedules the alarm 10 minutes from now.
     * Uses setExactAndAllowWhileIdle for precise timing.
     */
    private fun handleSnooze(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager
        val alarmIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = AlarmReceiver.ACTION_ALARM_TRIGGER
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context, 0, alarmIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val snoozeTime = System.currentTimeMillis() + 10 * 60 * 1000L
        alarmManager.setExactAndAllowWhileIdle(
            android.app.AlarmManager.RTC_WAKEUP, snoozeTime, pendingIntent
        )

        // Update widget UI to reflect snoozed state
        updateAllWidgets(context)
    }
}
`,
  },
  {
    id: 'manifest',
    name: 'AndroidManifest.xml',
    language: 'xml',
    path: 'app/src/main/AndroidManifest.xml',
    description:
      'Declares all permissions, receivers, services, and the Yandex Ads App ID metadata.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Core permissions -->
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

    <!-- Network & ad permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Boot complete for alarm restoration -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <application
        android:name=".GaiaAlarmApp"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.GaiaAlarm"
        tools:targetApi="31">

        <!-- Yandex Mobile Ads App ID (replace with your real App ID) -->
        <meta-data
            android:name="com.yandex.mobile.ads.appid"
            android:value="R-M-12345678-1" />

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:showWhenLocked="true"
            android:turnScreenOn="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Alarm trigger receiver -->
        <receiver
            android:name=".AlarmReceiver"
            android:exported="false"
            android:enabled="true">
            <intent-filter>
                <action android:name="com.gaiaalarm.ALARM_TRIGGER" />
                <action android:name="com.gaiaalarm.DISMISS" />
            </intent-filter>
        </receiver>

        <!-- Boot completed receiver to restore alarm schedule -->
        <receiver
            android:name=".BootReceiver"
            android:exported="false"
            android:enabled="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.LOCKED_BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

        <!-- Home screen widget provider -->
        <receiver
            android:name=".MyWidgetProvider"
            android:exported="true"
            android:enabled="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
                <action android:name="android.intent.action.TIME_TICK" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/widget_info" />
        </receiver>

    </application>
</manifest>
`,
  },
  {
    id: 'activity-main',
    name: 'activity_main.xml',
    language: 'xml',
    path: 'app/src/main/res/layout/activity_main.xml',
    description:
      'Material Design layout with TimePicker, label field, vibration switch, alarm buttons, and Yandex AdView at the bottom. Ads only appear here — not in the widget.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:ads="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/gaia_background"
    android:padding="24dp">

    <!-- App branding header -->
    <TextView
        android:id="@+id/tvTitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="GaiaAlarm"
        android:textColor="@color/gaia_primary"
        android:textSize="32sp"
        android:textStyle="bold"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent" />

    <!-- TimePicker for alarm time selection -->
    <TimePicker
        android:id="@+id/timePicker"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="24dp"
        app:layout_constraintTop_toBottomOf="@id/tvTitle"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:timePickerMode="spinner"
        android:hour="7"
        android:minute="30" />

    <!-- Alarm label input -->
    <EditText
        android:id="@+id/etLabel"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:hint="Alarm label"
        android:text="Wake up!"
        android:inputType="text"
        android:maxLines="1"
        android:backgroundTint="@color/gaia_primary"
        app:layout_constraintTop_toBottomOf="@id/timePicker" />

    <!-- Vibration toggle switch -->
    <LinearLayout
        android:id="@+id/vibrateRow"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="12dp"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        app:layout_constraintTop_toBottomOf="@id/etLabel">

        <TextView
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="Vibrate"
            android:textSize="16sp" />

        <com.google.android.material.switchmaterial.SwitchMaterial
            android:id="@+id/switchVibration"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:checked="true" />
    </LinearLayout>

    <!-- "Set Alarm" button -->
    <com.google.android.material.button.MaterialButton
        android:id="@+id/btnSetAlarm"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:text="Set Alarm"
        app:backgroundTint="@color/gaia_primary"
        app:layout_constraintTop_toBottomOf="@id/vibrateRow" />

    <!-- "Cancel Alarm" button -->
    <com.google.android.material.button.MaterialButton
        android:id="@+id/btnCancelAlarm"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:text="Cancel Alarm"
        style="@style/Widget.Material3.Button.TonalButton"
        app:layout_constraintTop_toBottomOf="@id/btnSetAlarm" />

    <!--
        Yandex Mobile Ads Banner — ONLY in the main app activity.
        This view is NOT included in the widget layout.
    -->
    <com.yandex.mobile.ads.banner.BannerAdView
        android:id="@+id/bannerAd"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:visibility="gone"
        app:layout_constraintTop_toBottomOf="@id/btnCancelAlarm"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
`,
  },
  {
    id: 'widget-layout',
    name: 'widget_layout.xml',
    language: 'xml',
    path: 'app/src/main/res/layout/widget_layout.xml',
    description:
      'Home screen widget layout — NO advertising. Displays current time, next alarm time, label, and Snooze button. Uses RemoteViews-compatible components only.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_root"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="12dp"
    android:background="@drawable/widget_background">

    <!-- Current time (large, bold) -->
    <TextView
        android:id="@+id/widget_current_time"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="07:30"
        android:textColor="@color/white"
        android:textSize="36sp"
        android:textStyle="bold"
        android:fontFamily="sans-serif-medium" />

    <!-- Next alarm time -->
    <TextView
        android:id="@+id/widget_next_alarm"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="4dp"
        android:text="Next alarm: 07:30"
        android:textColor="@color/gaia_light"
        android:textSize="14sp" />

    <!-- Alarm label -->
    <TextView
        android:id="@+id/widget_label"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="2dp"
        android:text="Wake up!"
        android:textColor="@color/gaia_light"
        android:textSize="13sp"
        android:maxLines="1"
        android:ellipsize="end" />

    <!-- Snooze button (postpones alarm by 10 minutes) -->
    <Button
        android:id="@+id/widget_snooze"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="end"
        android:layout_marginTop="8dp"
        android:text="Snooze"
        android:textSize="12sp"
        android:background="@drawable/widget_btn_background"
        android:textColor="@color/white"
        android:paddingStart="16dp"
        android:paddingEnd="16dp"
        android:minHeight="32dp" />

</LinearLayout>
`,
  },
  {
    id: 'widget-info',
    name: 'widget_info.xml',
    language: 'xml',
    path: 'app/src/main/res/xml/widget_info.xml',
    description:
      'Widget provider metadata — defines dimensions, update interval, preview, and minSdk compatibility.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp"
    android:minHeight="110dp"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/widget_layout"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:previewLayout="@layout/widget_layout"
    android:targetCellWidth="3"
    android:targetCellHeight="2" />
`,
  },
  {
    id: 'application',
    name: 'GaiaAlarmApp.kt',
    language: 'kotlin',
    path: 'app/src/main/java/com/gaiaalarm/GaiaAlarmApp.kt',
    description:
      'Application class for Yandex Mobile Ads SDK initialization. Must be called before any ad loading.',
    code: `package com.gaiaalarm

import android.app.Application
import com.yandex.mobile.ads.common.MobileAds

/**
 * Custom Application class for GaiaAlarm.
 * Initializes the Yandex Mobile Ads SDK before any ad operations.
 * The SDK should be initialized once at app startup.
 */
class GaiaAlarmApp : Application() {

    override fun onCreate() {
        super.onCreate()

        // Initialize Yandex Mobile Ads SDK
        // This must be called before loading any ads
        MobileAds.initialize(this) { }
    }
}
`,
  },
  {
    id: 'ad-ids',
    name: 'AdIds.kt',
    language: 'kotlin',
    path: 'app/src/main/java/com/gaiaalarm/AdIds.kt',
    description:
      'Constants file for Yandex Ad Unit IDs. Replace demo IDs with real production IDs from Yandex Partner.',
    code: `package com.gaiaalarm

/**
 * Yandex Mobile Ads Ad Unit IDs.
 *
 * These are demo/test IDs. Replace with your real ad unit IDs
 * from the Yandex Partner interface before publishing.
 *
 * IMPORTANT: Ads only appear in the main app screen (MainActivity).
 * The widget does not contain any advertising code or views.
 */
object AdIds {
    // Demo Yandex banner Ad Unit ID
    const val BANNER_UNIT_ID = "demo-banner-yandex"

    // Demo Yandex App ID
    const val APP_ID = "R-M-DEMO-000000"
}
`,
  },
  {
    id: 'build-gradle',
    name: 'build.gradle (app)',
    language: 'gradle',
    path: 'app/build.gradle.kts',
    description:
      'App-level Gradle build file with dependencies for Glance, Yandex Mobile Ads, Lifecycle, Material, and core AndroidX libraries.',
    code: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.gaiaalarm"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.gaiaalarm"
        minSdk = 23        // Android 6.0 — API 23+ support
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        viewBinding = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")

    // Material Design
    implementation("com.google.android.material:material:1.11.0")

    // ConstraintLayout
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")

    // MVVM — ViewModel & LiveData
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-livedata-ktx:2.7.0")
    implementation("androidx.activity:activity-ktx:1.8.2")

    // Jetpack Glance for App Widgets (preferred)
    implementation("androidx.glance:glance-appwidget:1.0.0")
    implementation("androidx.glance:glance-material3:1.0.0")

    // Yandex Mobile Ads SDK
    implementation("com.yandex.android:mobileads:6.3.0")

    // DataStore (alternative to SharedPreferences)
    implementation("androidx.datastore:datastore-preferences:1.0.0")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
}
`,
  },
];
