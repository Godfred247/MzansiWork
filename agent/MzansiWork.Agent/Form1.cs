using System.Runtime.InteropServices;

namespace MzansiWork.Agent;

public partial class Form1 : Form
{
    private readonly AgentSession session = new();
    private readonly Label status = new();
    private readonly Label sync = new();
    private readonly Label who = new();
    private readonly TextBox email = new();
    private readonly TextBox password = new();
    private readonly Button primary = new();
    private readonly Button pause = new();
    private readonly Button syncButton = new();
    private readonly NumericUpDown threshold = new();
    private readonly System.Windows.Forms.Timer timer = new();
    private readonly NotifyIcon tray;
    private bool idleOpen;
    private bool allowExit;

    public Form1()
    {
        InitializeComponent();
        Text = "MzansiWork";
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        ClientSize = new Size(420, 560);
        BackColor = Color.FromArgb(20, 33, 61);
        Font = new Font("Segoe UI", 10);
        ForeColor = Color.White;

        Controls.Add(Label("MzansiWork", 24, 20, 18, true));
        who = Label("Not signed in", 52, 20, 11, false);
        Controls.Add(who);
        status = Label("Not signed in", 88, 20, 16, true);
        status.ForeColor = Color.FromArgb(153, 222, 214);
        Controls.Add(status);
        sync = Label("Events stay on this computer until they synchronise.", 124, 20, 9, false);
        sync.MaximumSize = new Size(380, 0);
        Controls.Add(sync);

        email.SetBounds(20, 190, 380, 32);
        email.PlaceholderText = "Work email";
        password.SetBounds(20, 230, 380, 32);
        password.PlaceholderText = "Password";
        password.UseSystemPasswordChar = true;
        primary.SetBounds(20, 274, 380, 40);
        primary.Text = "Sign in";
        primary.BackColor = Color.FromArgb(37, 99, 235);
        primary.ForeColor = Color.White;
        primary.FlatStyle = FlatStyle.Flat;
        primary.Click += async (_, _) => await OnPrimary();
        pause.SetBounds(20, 324, 185, 36);
        pause.Text = "Pause tracking";
        StyleSecondary(pause);
        pause.Click += (_, _) => { session.SetPaused(!session.Paused); RefreshView(); };
        syncButton.SetBounds(215, 324, 185, 36);
        syncButton.Text = "Sync now";
        StyleSecondary(syncButton);
        syncButton.Click += async (_, _) => { await session.Sync(); RefreshView(); };
        Controls.AddRange([email, password, primary, pause, syncButton]);

        Controls.Add(Label("Idle threshold (minutes, set by the employer)", 380, 20, 9, false));
        threshold.SetBounds(20, 404, 80, 28);
        threshold.Minimum = 1;
        threshold.Maximum = 60;
        threshold.Value = 5;
        threshold.Enabled = false;
        Controls.Add(threshold);
        var policy = Label("Read-only while the employer manages the policy. Idle time is an observation, not a deduction.", 440, 20, 9, false);
        policy.MaximumSize = new Size(380, 0);
        Controls.Add(policy);
        var note = Label("Closing this window leaves the agent in the tray. Tracking stops only when you pause it or sign out.", 500, 20, 9, false);
        note.MaximumSize = new Size(380, 0);
        Controls.Add(note);

        components ??= new System.ComponentModel.Container();
        tray = new NotifyIcon(components) { Text = "MzansiWork — not tracking", Visible = true, Icon = SystemIcons.Application };
        tray.DoubleClick += (_, _) => ShowAgain();
        var menu = new ContextMenuStrip();
        menu.Items.Add("Open", null, (_, _) => ShowAgain());
        menu.Items.Add("Exit", null, (_, _) => { allowExit = true; Close(); });
        tray.ContextMenuStrip = menu;

        timer.Interval = 2000;
        timer.Tick += (_, _) => WatchIdle();
        timer.Start();
        FormClosing += OnClosing;
        RefreshView();
    }

    private async Task OnPrimary()
    {
        if (session.Token is null)
        {
            primary.Enabled = false;
            var error = await session.SignIn(email.Text.Trim(), password.Text);
            primary.Enabled = true;
            if (error is not null) MessageBox.Show(error, "MzansiWork");
        }
        else session.SignOut();
        RefreshView();
    }

    private void WatchIdle()
    {
        if (session.Token is null || session.Paused) return;
        var idleSeconds = IdleSeconds();
        var reached = idleSeconds >= (int)threshold.Value * 60;
        if (reached && !idleOpen)
        {
            idleOpen = true;
            session.ObserveIdle(true, (int)threshold.Value);
            tray.ShowBalloonTip(3000, "MzansiWork", "Idle interval detected. You can explain it in the employee portal.", ToolTipIcon.Info);
            RefreshView();
        }
        else if (!reached && idleOpen)
        {
            idleOpen = false;
            session.ObserveIdle(false, (int)threshold.Value);
            RefreshView();
        }
    }

    private void RefreshView()
    {
        var signedIn = session.Token is not null;
        who.Text = signedIn ? $"{session.EmployeeName} · {session.Organisation}" : "Sign in with your employee account";
        status.Text = session.Status;
        sync.Text = $"{session.SyncMessage}  ·  {session.Pending} waiting";
        email.Visible = password.Visible = !signedIn;
        primary.Text = signedIn ? "Sign out" : "Sign in";
        pause.Enabled = syncButton.Enabled = signedIn;
        pause.Text = session.Paused ? "Resume tracking" : "Pause tracking";
        tray.Text = $"MzansiWork — {session.Status}";
    }

    private void OnClosing(object? sender, FormClosingEventArgs e)
    {
        if (allowExit) return;
        e.Cancel = true;
        Hide();
        tray.ShowBalloonTip(2000, "MzansiWork", "The window is closed. Tracking continues in the tray until you pause or sign out.", ToolTipIcon.Info);
    }

    private void ShowAgain()
    {
        Show();
        WindowState = FormWindowState.Normal;
        Activate();
    }

    private static Label Label(string text, int top, int left, float size, bool bold) => new()
    {
        Text = text,
        Left = left,
        Top = top,
        AutoSize = true,
        ForeColor = Color.White,
        Font = new Font("Segoe UI", size, bold ? FontStyle.Bold : FontStyle.Regular)
    };

    private static void StyleSecondary(Button button)
    {
        button.BackColor = Color.FromArgb(30, 45, 77);
        button.ForeColor = Color.White;
        button.FlatStyle = FlatStyle.Flat;
    }

    private static int IdleSeconds()
    {
        var info = new LASTINPUTINFO { cbSize = (uint)Marshal.SizeOf<LASTINPUTINFO>() };
        if (!GetLastInputInfo(ref info)) return 0;
        return unchecked(Environment.TickCount - (int)info.dwTime) / 1000;
    }

    [DllImport("user32.dll")]
    private static extern bool GetLastInputInfo(ref LASTINPUTINFO info);

    [StructLayout(LayoutKind.Sequential)]
    private struct LASTINPUTINFO
    {
        public uint cbSize;
        public uint dwTime;
    }
}
