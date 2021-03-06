=head1 NAME

  Global API test

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
use Paysys;

our (
  %conf
);

my $ARGS = parse_arguments(\@ARGV);
my $apiKey = $ARGS->{KEY} || $ARGV[$#ARGV] || q{};
my @test_list = folder_list($ARGS, $RealBin);
my $debug = $ARGS->{DEBUG} || 0;

my $login = $conf{API_TEST_USER_LOGIN} || 'test';
my $password = $conf{API_TEST_USER_PASSWORD} || '123456';

if (lc($ARGV[0]) eq 'help' || defined($ARGS->{help}) || defined($ARGS->{HELP})) {
  help();
  exit 0;
}

foreach my $test (@test_list) {
  if ($test->{path} =~ /users\/login\//g) {
    $test->{body}->{login} = $login;
    $test->{body}->{password} = $password;
  }
}

test_runner({
  apiKey => $apiKey,
  debug  => $debug
}, \@test_list);

done_testing();

1;
