import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Instagram } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20).regex(/^[a-zA-Z0-9_.]+$/, 'Letters, numbers, dots and underscores only'),
  fullName: z.string().min(1, 'Full name is required'),
});

type FormData = z.infer<typeof schema>;

function friendlyError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('password') && lower.includes('weak')) {
    return 'This password has been found in a data breach. Please choose a unique password.';
  }
  if (lower.includes('already') && lower.includes('registered')) {
    return 'An account with this email already exists. Try signing in.';
  }
  if (lower.includes('email') && lower.includes('confirm')) {
    return 'Please check your email and click the confirmation link, then sign in.';
  }
  if (lower.includes('invalid') && lower.includes('credential')) {
    return 'Incorrect email or password.';
  }
  return message;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', data.username)
      .maybeSingle();

    if (existing) {
      setLoading(false);
      toast.error('Username is already taken');
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError) {
      setLoading(false);
      toast.error(friendlyError(signUpError.message));
      return;
    }

    const userId = signUpData.user?.id;

    if (userId) {
      const { error: profileError } = await supabase.from('profiles').update({
        username: data.username,
        full_name: data.fullName,
      }).eq('id', userId);

      if (profileError) {
        setLoading(false);
        toast.error('Username is already taken');
        return;
      }
    }

    if (signUpData.session) {
      setLoading(false);
      toast.success('Account created!');
      navigate('/');
      return;
    }

    // No session — email confirmation may be required
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      setLoading(false);
      toast.success('Account created! Please sign in with your credentials.');
      navigate('/login');
      return;
    }

    if (signInData.user) {
      await supabase.from('profiles').update({
        username: data.username,
        full_name: data.fullName,
      }).eq('id', signInData.user.id);
    }

    setLoading(false);
    toast.success('Account created!');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center">
            <Instagram className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
          <p className="text-sm text-muted-foreground">Join the community today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" type="text" placeholder="Jane Doe" {...register('fullName')} />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" placeholder="jane_doe" {...register('username')} />
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Use a unique password" {...register('password')} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            <p className="text-xs text-muted-foreground">Use a unique password not seen in data breaches.</p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sign up
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
