import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/auth/auth_session_manager.dart';
import '../../../auth/data/models/auth_user.dart';
import '../../../auth/presentation/pages/login_page.dart';

class CustomerHomePage extends StatefulWidget {
  const CustomerHomePage({super.key});

  @override
  State<CustomerHomePage> createState() => _CustomerHomePageState();
}

class _CustomerHomePageState extends State<CustomerHomePage> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      const _HomeOverviewTab(),
      const _PlaceholderTab(
        title: 'Catalogo',
        subtitle: 'Pronto mostraremos productos y filtros.',
        icon: Icons.local_pharmacy_outlined,
      ),
      const _PlaceholderTab(
        title: 'Carrito',
        subtitle: 'Tu resumen de compra aparecera aqui.',
        icon: Icons.shopping_cart_outlined,
      ),
      const _ProfileTab(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Farmacia Bibosi',
          style: GoogleFonts.manrope(fontWeight: FontWeight.w800, fontSize: 22),
        ),
        centerTitle: false,
        backgroundColor: const Color(0xFFF8FAF9),
        elevation: 0,
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications_none_outlined),
          ),
        ],
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 250),
        child: pages[_selectedIndex],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) =>
            setState(() => _selectedIndex = index),
        backgroundColor: Colors.white,
        indicatorColor: const Color(0x268BF1E6),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Inicio',
          ),
          NavigationDestination(
            icon: Icon(Icons.local_pharmacy_outlined),
            selectedIcon: Icon(Icons.local_pharmacy),
            label: 'Catalogo',
          ),
          NavigationDestination(
            icon: Icon(Icons.shopping_cart_outlined),
            selectedIcon: Icon(Icons.shopping_cart),
            label: 'Carrito',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Perfil',
          ),
        ],
      ),
    );
  }
}

class _ProfileTab extends StatefulWidget {
  const _ProfileTab();

  @override
  State<_ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<_ProfileTab> {
  AuthUser? _user;
  bool _loading = true;
  bool _loggingOut = false;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final storedUser = await AuthSessionManager.getStoredUser();
    if (!mounted) return;
    setState(() {
      _user = storedUser;
      _loading = false;
    });
  }

  Future<void> _logout() async {
    setState(() => _loggingOut = true);
    await AuthSessionManager.logoutAndClear();

    if (!mounted) return;

    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginPage()),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Container(
          width: 460,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0x1ABDC9C5)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircleAvatar(
                radius: 34,
                backgroundColor: Color(0x1A8BF1E6),
                child: Icon(Icons.person, size: 36, color: Color(0xFF006A5E)),
              ),
              const SizedBox(height: 12),
              Text(
                _user?.fullName ?? 'Cliente',
                style: GoogleFonts.manrope(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF191C1C),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                _user?.email ?? '-',
                style: const TextStyle(
                  color: Color(0xFF3E4946),
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  color: const Color(0x1A8BF1E6),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  'Rol: ${_user?.role.isNotEmpty == true ? _user!.role : 'cliente'}',
                  style: const TextStyle(
                    color: Color(0xFF006A5E),
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _loggingOut ? null : _logout,
                  icon: const Icon(Icons.logout),
                  label: Text(
                    _loggingOut ? 'Cerrando sesion...' : 'Cerrar sesion',
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HomeOverviewTab extends StatelessWidget {
  const _HomeOverviewTab();

  @override
  Widget build(BuildContext context) {
    return ListView(
      key: const ValueKey('customer-home'),
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: const LinearGradient(
              colors: [Color(0xFF006A5E), Color(0xFF008577)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Bienvenido de vuelta',
                style: GoogleFonts.inter(
                  color: Colors.white.withValues(alpha: 0.92),
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Tu salud, en un solo lugar',
                style: GoogleFonts.manrope(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: 26,
                  height: 1.1,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Consulta productos, recetas y seguimiento de pedidos desde tu app cliente.',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  height: 1.45,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        Text(
          'Accesos rapidos',
          style: GoogleFonts.manrope(
            fontWeight: FontWeight.w800,
            fontSize: 20,
            color: const Color(0xFF191C1C),
          ),
        ),
        const SizedBox(height: 12),
        const Row(
          children: [
            Expanded(
              child: _QuickActionCard(
                icon: Icons.search,
                label: 'Buscar\nmedicamento',
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: _QuickActionCard(
                icon: Icons.receipt_long_outlined,
                label: 'Mis\nrecetas',
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        const Row(
          children: [
            Expanded(
              child: _QuickActionCard(
                icon: Icons.local_shipping_outlined,
                label: 'Seguimiento\nde pedido',
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: _QuickActionCard(
                icon: Icons.support_agent_outlined,
                label: 'Soporte\nfarmaceutico',
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  const _QuickActionCard({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {},
      borderRadius: BorderRadius.circular(16),
      child: Ink(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0x1ABDC9C5)),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: const BoxDecoration(
                color: Color(0x1A8BF1E6),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: const Color(0xFF006A5E)),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  color: Color(0xFF191C1C),
                  fontWeight: FontWeight.w600,
                  height: 1.2,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlaceholderTab extends StatelessWidget {
  const _PlaceholderTab({
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  final String title;
  final String subtitle;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Container(
          width: 420,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0x1ABDC9C5)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 42, color: const Color(0xFF006A5E)),
              const SizedBox(height: 12),
              Text(
                title,
                style: GoogleFonts.manrope(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF191C1C),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                subtitle,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFF3E4946),
                  fontSize: 14,
                  height: 1.45,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
