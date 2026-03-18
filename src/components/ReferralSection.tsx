'use client';
// import { useState, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/hooks/useAuth';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { 
//   Gift, Copy, Share2, Users, IndianRupee, 
//   CheckCircle, Clock, Sparkles 
// } from 'lucide-react';
// import { toast } from 'sonner';
// import { format } from 'date-fns';

// interface Referral {
//   id: string;
//   referred_id: string;
//   status: string;
//   referrer_reward: number;
//   referred_reward: number;
//   completed_at: string | null;
//   created_at: string;
//   referred_profile?: {
//     full_name: string | null;
//     avatar_url: string | null;
//   };
// }

// export function ReferralSection() {
//   const { user, profile } = useAuth();
//   const [referrals, setReferrals] = useState<Referral[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     totalReferrals: 0,
//     completedReferrals: 0,
//     totalEarnings: 0
//   });

//   useEffect(() => {
//     if (user) {
//       fetchReferrals();
//     }
//   }, [user]);

//   const fetchReferrals = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('referrals')
//         .select('*')
//         .eq('referrer_id', user?.id)
//         .order('created_at', { ascending: false });

//       if (error) throw error;

//       // Fetch referred users' profiles
//       const referralsWithProfiles = await Promise.all(
//         (data || []).map(async (referral) => {
//           const { data: profileData } = await supabase
//             .from('profiles')
//             .select('full_name, avatar_url')
//             .eq('id', referral.referred_id)
//             .single();
          
//           return {
//             ...referral,
//             referred_profile: profileData
//           };
//         })
//       );

//       setReferrals(referralsWithProfiles);

//       // Calculate stats
//       const completed = referralsWithProfiles.filter(r => r.status === 'rewarded');
//       setStats({
//         totalReferrals: referralsWithProfiles.length,
//         completedReferrals: completed.length,
//         totalEarnings: completed.reduce((acc, r) => acc + r.referrer_reward, 0)
//       });
//     } catch (error) {
//       console.error('Error fetching referrals:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyReferralCode = () => {
//     if (profile?.referral_code) {
//       navigator.clipboard.writeText(profile.referral_code);
//       toast.success('Referral code copied!');
//     }
//   };

//   const shareReferral = async () => {
//     const shareText = `Join Trapy using my referral code ${profile?.referral_code} and get ₹25 in your wallet after your first ride! Download now: https://trapy.app`;
    
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: 'Join Trapy - Share Your Ride',
//           text: shareText,
//         });
//       } catch (err) {
//         copyReferralCode();
//       }
//     } else {
//       navigator.clipboard.writeText(shareText);
//       toast.success('Share message copied to clipboard!');
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'rewarded':
//         return <Badge className="bg-green-500">Completed</Badge>;
//       case 'completed':
//         return <Badge className="bg-blue-500">Processing</Badge>;
//       default:
//         return <Badge variant="secondary">Pending</Badge>;
//     }
//   };

//   if (loading) {
//     return <div className="p-4">Loading referral data...</div>;
//   }

//   return (
//     <div className="space-y-6">
//       {/* Referral Code Card */}
//       <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Gift className="h-5 w-5 text-primary" />
//             Referral Program
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <p className="text-muted-foreground">
//             Share your referral code and earn <span className="font-bold text-primary">₹50</span> for each friend who completes their first ride. Your friend gets <span className="font-bold text-primary">₹25</span> too!
//           </p>
          
//           <div className="bg-background/60 rounded-lg p-4 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-muted-foreground">Your Referral Code</p>
//               <p className="text-2xl font-mono font-bold tracking-wider">
//                 {profile?.referral_code || 'Loading...'}
//               </p>
//             </div>
//             <div className="flex gap-2">
//               <Button variant="outline" size="icon" onClick={copyReferralCode}>
//                 <Copy className="h-4 w-4" />
//               </Button>
//               <Button onClick={shareReferral}>
//                 <Share2 className="h-4 w-4 mr-2" />
//                 Share
//               </Button>
//             </div>
//           </div>

//           {/* How it works */}
//           <div className="pt-4 border-t">
//             <p className="text-sm font-medium mb-3">How it works:</p>
//             <div className="grid grid-cols-3 gap-4 text-center">
//               <div>
//                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
//                   <Share2 className="h-5 w-5 text-primary" />
//                 </div>
//                 <p className="text-xs">Share your code</p>
//               </div>
//               <div>
//                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
//                   <Users className="h-5 w-5 text-primary" />
//                 </div>
//                 <p className="text-xs">Friend signs up</p>
//               </div>
//               <div>
//                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
//                   <Sparkles className="h-5 w-5 text-primary" />
//                 </div>
//                 <p className="text-xs">Both get rewarded</p>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-4">
//         <Card>
//           <CardContent className="p-4 text-center">
//             <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
//             <p className="text-2xl font-bold">{stats.totalReferrals}</p>
//             <p className="text-xs text-muted-foreground">Total Referrals</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4 text-center">
//             <CheckCircle className="h-5 w-5 mx-auto text-green-500 mb-1" />
//             <p className="text-2xl font-bold text-green-500">{stats.completedReferrals}</p>
//             <p className="text-xs text-muted-foreground">Completed</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4 text-center">
//             <IndianRupee className="h-5 w-5 mx-auto text-primary mb-1" />
//             <p className="text-2xl font-bold text-primary">₹{stats.totalEarnings}</p>
//             <p className="text-xs text-muted-foreground">Earned</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Referral List */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg">Your Referrals</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {referrals.length === 0 ? (
//             <div className="text-center py-8">
//               <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//               <p className="text-muted-foreground">No referrals yet</p>
//               <p className="text-sm text-muted-foreground">Share your code to start earning!</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {referrals.map(referral => (
//                 <div 
//                   key={referral.id} 
//                   className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
//                 >
//                   <div className="flex items-center gap-3">
//                     <Avatar>
//                       <AvatarImage src={referral.referred_profile?.avatar_url || ''} />
//                       <AvatarFallback>
//                         {referral.referred_profile?.full_name?.charAt(0) || 'U'}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <p className="font-medium">
//                         {referral.referred_profile?.full_name || 'User'}
//                       </p>
//                       <p className="text-xs text-muted-foreground">
//                         Joined {format(new Date(referral.created_at), 'MMM d, yyyy')}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     {getStatusBadge(referral.status)}
//                     {referral.status === 'rewarded' && (
//                       <p className="text-xs text-green-500 mt-1">+₹{referral.referrer_reward}</p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
