import 'package:flutter/material.dart';

void main() {
  runApp(const CryptoHealthApp());
}

class CryptoHealthApp extends StatelessWidget {
  const CryptoHealthApp({super.key});

  @override
  Widget build(BuildContext context) {
    const teal = Color(0xFF0F766E);
    return MaterialApp(
      title: 'CryptoHealth',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: teal, brightness: Brightness.light),
        scaffoldBackgroundColor: const Color(0xFFF5F8FA),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF0F172A),
          elevation: 0,
          centerTitle: false,
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        ),
      ),
      home: const PatientHomePage(),
    );
  }
}

class PatientHomePage extends StatefulWidget {
  const PatientHomePage({super.key});

  @override
  State<PatientHomePage> createState() => _PatientHomePageState();
}

class _PatientHomePageState extends State<PatientHomePage> {
  int _selectedIndex = 0;
  String _searchQuery = '';
  final List<MedicalRecord> _records = [
    MedicalRecord(
      title: 'Complete Blood Count',
      type: 'Blood Test',
      facility: 'City Diagnostic Centre',
      date: DateTime(2026, 9, 18),
      status: 'Encrypted',
      icon: Icons.water_drop_outlined,
    ),
    MedicalRecord(
      title: 'MRI Brain Scan',
      type: 'Radiology',
      facility: 'Coastal Medical Institute',
      date: DateTime(2026, 8, 30),
      status: 'Encrypted',
      icon: Icons.center_focus_strong_outlined,
    ),
    MedicalRecord(
      title: 'Electrocardiogram',
      type: 'Cardiology',
      facility: 'City Diagnostic Centre',
      date: DateTime(2026, 7, 12),
      status: 'Encrypted',
      icon: Icons.monitor_heart_outlined,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final pages = [
      _buildDashboard(),
      _buildRecordsPage(),
      _buildSharingPage(),
      _buildSecurityPage(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: const Color(0xFFD9F4EF),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.health_and_safety_outlined, color: Color(0xFF0F766E)),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('CryptoHealth', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
                Text('Your records. Your choice.', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w400)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Notifications',
            onPressed: () => _showMessage('You are all caught up.'),
            icon: const Icon(Icons.notifications_none_rounded),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 200),
          child: pages[_selectedIndex],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) => setState(() => _selectedIndex = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.grid_view_rounded), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.folder_open_outlined), label: 'Records'),
          NavigationDestination(icon: Icon(Icons.qr_code_2_rounded), label: 'Sharing'),
          NavigationDestination(icon: Icon(Icons.shield_outlined), label: 'Security'),
        ],
      ),
      floatingActionButton: _selectedIndex == 1
          ? FloatingActionButton.extended(
              onPressed: _showUploadInfo,
              icon: const Icon(Icons.add),
              label: const Text('Add record'),
            )
          : null,
    );
  }

  Widget _buildDashboard() {
    return ListView(
      key: const ValueKey('dashboard'),
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
      children: [
        Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0F766E), Color(0xFF155E75)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: .14), borderRadius: BorderRadius.circular(30)),
                child: const Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.lock_outline, size: 14, color: Colors.white),
                  SizedBox(width: 6),
                  Text('PATIENT-CONTROLLED HEALTHCARE', style: TextStyle(color: Colors.white, fontSize: 10, letterSpacing: 1, fontWeight: FontWeight.w700)),
                ]),
              ),
              const SizedBox(height: 18),
              const Text('Your health history,\nall in one secure place.', style: TextStyle(color: Colors.white, fontSize: 26, height: 1.12, fontWeight: FontWeight.w800)),
              const SizedBox(height: 10),
              Text('Keep reports together and choose when to share them with a healthcare provider.', style: TextStyle(color: Colors.white.withValues(alpha: .82), height: 1.45)),
              const SizedBox(height: 20),
              Row(children: [
                FilledButton.icon(
                  style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: const Color(0xFF0F766E)),
                  onPressed: () => setState(() => _selectedIndex = 1),
                  icon: const Icon(Icons.folder_open_outlined, size: 18),
                  label: const Text('My records'),
                ),
                const SizedBox(width: 10),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(foregroundColor: Colors.white, side: const BorderSide(color: Colors.white70)),
                  onPressed: () => setState(() => _selectedIndex = 2),
                  icon: const Icon(Icons.qr_code_2, size: 18),
                  label: const Text('Share securely'),
                ),
              ]),
            ],
          ),
        ),
        const SizedBox(height: 22),
        const _SectionTitle(title: 'Your health locker', subtitle: 'A quick overview of your saved records'),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: _MetricCard(icon: Icons.folder_copy_outlined, value: '${_records.length}', label: 'Saved records', tone: const Color(0xFFDBEAFE), iconColor: const Color(0xFF1D4ED8))),
          const SizedBox(width: 10),
          const Expanded(child: _MetricCard(icon: Icons.verified_user_outlined, value: 'On', label: 'Encryption', tone: Color(0xFFD1FAE5), iconColor: Color(0xFF047857))),
        ]),
        const SizedBox(height: 22),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const _SectionTitle(title: 'Recent records', subtitle: 'Your latest additions'),
            TextButton(onPressed: () => setState(() => _selectedIndex = 1), child: const Text('View all')),
          ],
        ),
        const SizedBox(height: 8),
        ..._records.take(2).map((record) => _RecordTile(record: record, onTap: () => _showRecord(record))),
        const SizedBox(height: 12),
        const _InfoBanner(
          icon: Icons.info_outline_rounded,
          title: 'You’re in control',
          message: 'Sharing access should be time-limited and can be revoked. Only share records with a provider you trust.',
        ),
      ],
    );
  }

  Widget _buildRecordsPage() {
    return ListView(
      key: const ValueKey('records'),
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
      children: [
        const _SectionTitle(title: 'Medical records', subtitle: 'Your saved diagnostic history'),
        const SizedBox(height: 18),
        TextField(
          decoration: InputDecoration(
            hintText: 'Search your records',
            prefixIcon: const Icon(Icons.search_rounded),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
          ),
          onChanged: (value) => setState(() => _searchQuery = value.trim().toLowerCase()),
        ),
        const SizedBox(height: 12),
        ..._records.where((record) => ('${record.title} ${record.type} ${record.facility}').toLowerCase().contains(_searchQuery)).map((record) => _RecordTile(record: record, onTap: () => _showRecord(record))),
        if (_records.where((record) => ('${record.title} ${record.type} ${record.facility}').toLowerCase().contains(_searchQuery)).isEmpty)
          const Padding(padding: EdgeInsets.all(24), child: Text('No records match your search.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF64748B)))),
        const SizedBox(height: 8),
        const _InfoBanner(icon: Icons.cloud_upload_outlined, title: 'Add a medical report', message: 'In the connected version, use the secure upload flow to add reports from a participating hospital or diagnostic centre.'),
      ],
    );
  }

  Widget _buildSharingPage() {
    return ListView(
      key: const ValueKey('sharing'),
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
      children: [
        const _SectionTitle(title: 'Share a record', subtitle: 'Share only what a provider needs'),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFE2E8F0))),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.qr_code_2_rounded, color: Color(0xFF0F766E), size: 38),
              const SizedBox(height: 12),
              const Text('Temporary access', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              const Text('Create a secure, expiring share token in the connected CryptoHealth service. This screen is a UI preview and does not generate live access credentials.', style: TextStyle(color: Color(0xFF64748B), height: 1.45)),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: _showShareInfo,
                  icon: const Icon(Icons.add_link_rounded),
                  label: const Text('Create secure share'),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        const _SectionTitle(title: 'Safe sharing checklist', subtitle: 'Before you grant access'),
        const SizedBox(height: 10),
        const _ChecklistItem(text: 'Choose only the report needed for the visit'),
        const _ChecklistItem(text: 'Check the recipient and their healthcare organization'),
        const _ChecklistItem(text: 'Set an expiry and a view-only scope where possible'),
        const _ChecklistItem(text: 'Revoke access when it is no longer needed'),
      ],
    );
  }

  Widget _buildSecurityPage() {
    return ListView(
      key: const ValueKey('security'),
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
      children: [
        const _SectionTitle(title: 'Security & privacy', subtitle: 'Understand how your record locker should protect you'),
        const SizedBox(height: 16),
        const _SecurityRow(icon: Icons.lock_outline, title: 'Encrypted storage', subtitle: 'The backend encrypts files before storage when configured correctly.', status: 'Backend dependent'),
        const _SecurityRow(icon: Icons.verified_outlined, title: 'Issuer verification', subtitle: 'A digital signature can help verify who issued a report and whether its signed content changed.', status: 'Cryptographic check'),
        const _SecurityRow(icon: Icons.history_rounded, title: 'Access history', subtitle: 'Sensitive record actions should be auditable.', status: 'Audit trail'),
        const SizedBox(height: 14),
        const _InfoBanner(icon: Icons.warning_amber_rounded, title: 'Prototype notice', message: 'This mobile screen currently uses sample UI data. Do not store real patient information here until authentication, API integration, secure key management, and privacy testing are complete.'),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () => _showMessage('Connect the mobile client to the configured CryptoHealth API before enabling live account management.'),
          icon: const Icon(Icons.link_rounded),
          label: const Text('Connection details'),
        ),
      ],
    );
  }

  void _showRecord(MedicalRecord record) {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) => Padding(
        padding: const EdgeInsets.fromLTRB(22, 8, 22, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(record.icon, size: 34, color: const Color(0xFF0F766E)),
            const SizedBox(height: 12),
            Text(record.title, style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            Text(record.facility, style: const TextStyle(color: Color(0xFF64748B))),
            const SizedBox(height: 14),
            _DetailRow(label: 'Record type', value: record.type),
            _DetailRow(label: 'Added', value: _formatDate(record.date)),
            _DetailRow(label: 'Storage state', value: record.status),
            const SizedBox(height: 10),
            const Text('Sample record metadata only. No medical file is loaded in this UI preview.', style: TextStyle(color: Color(0xFF64748B))),
          ],
        ),
      ),
    );
  }

  void _showUploadInfo() => _showMessage('Live upload becomes available after connecting the mobile app to the backend API.');
  void _showShareInfo() => _showMessage('Live share tokens must be created and validated by the authenticated backend.');
  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message), behavior: SnackBarBehavior.floating));
  }

  String _formatDate(DateTime date) => '${date.day.toString().padLeft(2, '0')} ${_month(date.month)} ${date.year}';
  String _month(int m) => const ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1];
}

class MedicalRecord {
  const MedicalRecord({required this.title, required this.type, required this.facility, required this.date, required this.status, required this.icon});
  final String title;
  final String type;
  final String facility;
  final DateTime date;
  final String status;
  final IconData icon;
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title, required this.subtitle});
  final String title;
  final String subtitle;
  @override
  Widget build(BuildContext context) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Text(title, style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
    const SizedBox(height: 4),
    Text(subtitle, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
  ]);
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.icon, required this.value, required this.label, required this.tone, required this.iconColor});
  final IconData icon;
  final String value;
  final String label;
  final Color tone;
  final Color iconColor;
  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(15),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(width: 38, height: 38, decoration: BoxDecoration(color: tone, borderRadius: BorderRadius.circular(12)), child: Icon(icon, color: iconColor)),
        const SizedBox(height: 16),
        Text(value, style: const TextStyle(fontSize: 25, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
        Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
      ]),
    ),
  );
}

class _RecordTile extends StatelessWidget {
  const _RecordTile({required this.record, required this.onTap});
  final MedicalRecord record;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 10),
    child: ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
      leading: Container(width: 44, height: 44, decoration: BoxDecoration(color: const Color(0xFFD9F4EF), borderRadius: BorderRadius.circular(13)), child: Icon(record.icon, color: const Color(0xFF0F766E))),
      title: Text(record.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 5),
        child: Text('${record.type} • ${record.facility}\n${record.date.day} ${record.date.month} ${record.date.year}', style: const TextStyle(height: 1.45, fontSize: 12, color: Color(0xFF64748B))),
      ),
      isThreeLine: true,
      trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
    ),
  );
}

class _InfoBanner extends StatelessWidget {
  const _InfoBanner({required this.icon, required this.title, required this.message});
  final IconData icon;
  final String title;
  final String message;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(15),
    decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFDBEAFE))),
    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Icon(icon, color: const Color(0xFF1D4ED8), size: 20),
      const SizedBox(width: 10),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF1E3A8A))),
        const SizedBox(height: 4),
        Text(message, style: const TextStyle(fontSize: 12, height: 1.45, color: Color(0xFF1E40AF))),
      ])),
    ]),
  );
}

class _ChecklistItem extends StatelessWidget {
  const _ChecklistItem({required this.text});
  final String text;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 7),
    child: Row(children: [
      const Icon(Icons.check_circle_outline, color: Color(0xFF0F766E), size: 20),
      const SizedBox(width: 10),
      Expanded(child: Text(text, style: const TextStyle(fontSize: 13, color: Color(0xFF334155)))),
    ]),
  );
}

class _SecurityRow extends StatelessWidget {
  const _SecurityRow({required this.icon, required this.title, required this.subtitle, required this.status});
  final IconData icon;
  final String title;
  final String subtitle;
  final String status;
  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 10),
    child: ListTile(
      leading: CircleAvatar(backgroundColor: const Color(0xFFD9F4EF), child: Icon(icon, color: const Color(0xFF0F766E))),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
      subtitle: Padding(padding: const EdgeInsets.only(top: 4), child: Text(subtitle, style: const TextStyle(fontSize: 12, height: 1.4, color: Color(0xFF64748B)))),
      trailing: const Icon(Icons.info_outline_rounded, color: Color(0xFF64748B)),
    ),
  );
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 6),
    child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: const TextStyle(color: Color(0xFF64748B))),
      Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
    ]),
  );
}
