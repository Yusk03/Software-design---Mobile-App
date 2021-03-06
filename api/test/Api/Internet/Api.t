=head1 NAME

  Paysys API test

=cut

use strict;
use warnings;

use lib '../';
use Test::More;
use Test::JSON::More;
use FindBin '$Bin';
use FindBin qw($RealBin);
use JSON;

require $Bin . '/../../../libexec/config.pl';

BEGIN {
  our $libpath = '../../../';
  my $sql_type = 'mysql';
  unshift(@INC, $libpath . "Abills/$sql_type/");
  unshift(@INC, $libpath);
  unshift(@INC, $libpath . 'lib/');
  unshift(@INC, $libpath . 'libexec/');
  unshift(@INC, $libpath . 'Abills/');
  unshift(@INC, $libpath . 'Abills/modules/');
}

use Abills::Defs;
use Init_t qw(test_runner folder_list help);
use Abills::Base qw(parse_arguments);
use Admins;
use Internet;
use Users;
use Shedule;

our (
  %conf
);

my $db = Abills::SQL->connect(
  $conf{dbtype}, $conf{dbhost}, $conf{dbname}, $conf{dbuser}, $conf{dbpasswd},
  {
    CHARSET => ($conf{dbcharset}) ? $conf{dbcharset} : undef,
    dbdebug => $conf{dbdebug}
  }
);
my $admin = Admins->new($db, \%conf);
my $Internet = Internet->new($db, $admin, \%conf);
my $Users = Users->new($db, $admin, \%conf);
my $Shedule  = Shedule->new($db, $admin, \%conf);

my $user = $Users->list({
  LOGIN     => $conf{API_TEST_USER_LOGIN} || 'test',
  COLS_NAME => 1,
});

my $service = $Internet->user_list({
  UID       => $user->[0]->{uid} || '---',
  TP_ID     => '_SHOW',
  ID        => '_SHOW',
  COLS_NAME => 1,
  PAGE_ROWS => 1
});

my $ARGS = parse_arguments(\@ARGV);
my $apiKey = $ARGS->{KEY} || $ARGV[$#ARGV] || q{};
my @test_list = folder_list($ARGS, $RealBin);
my $debug = $ARGS->{DEBUG} || 0;
my $message = 'no internet service for this user so cant do holdup' if (!scalar(@{$service}));

if (lc($ARGV[0]) eq 'help') {
  help();
  exit 0;
}

foreach my $test (@test_list) {
  if ($test->{path} =~ /user\/:uid\/internet\/:id\/holdup\//g) {
    my $id = (scalar(@{$service})) ? $service->[0]->{id} : '';
    $test->{path} =~ s/:id/$id/g;

    if ($test->{method} eq 'POST') {
      my $hold_up_min_period = 1;
      ($hold_up_min_period) = split(/:/, $conf{INTERNET_USER_SERVICE_HOLDUP}) if ($conf{INTERNET_USER_SERVICE_HOLDUP});

      $test->{body}->{from_date} = POSIX::strftime('%Y-%m-%d', localtime(time + 86400));
      $test->{body}->{to_date} = POSIX::strftime('%Y-%m-%d', localtime(time + 86400 * ($hold_up_min_period + 1)));
    }
  }
  elsif ($test->{path} =~ /user\/:uid\/internet\/:id/g) {
    if ($test->{method} eq 'DELETE') {
      $Shedule->info({ UID => $user->[0]->{uid}, TYPE => 'tp', MODULE => 'Internet' });
      $test->{path} =~ s/:id/$Shedule->{SHEDULE_ID}/g;
    }
  }
}

test_runner({
  apiKey  => $apiKey,
  debug   => $debug,
  message => $message || '',
}, \@test_list);

done_testing();

1;
