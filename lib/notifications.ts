import { createAdminClient } from './supabase/server'

interface NotificationPayload {
  to: string | string[]
  subject: string
  html: string
}

export class NotificationService {
  private static async send(payload: NotificationPayload) {
    const isDev = process.env.NODE_ENV === 'development'
    
    // MOCK IMPLEMENTATION: Logs to console. 
    // Ready for Resend: const resend = new Resend(process.env.RESEND_API_KEY);
    console.log(`[NotificationService] ${isDev ? 'DEV-MOCK' : 'PROD-QUEUE'}`)
    console.log(`To: ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}`)
    console.log(`Subject: ${payload.subject}`)
    console.log('--- Body ---')
    console.log(payload.html)
    console.log('------------')
    
    return { success: true, message_id: `mock_${Date.now()}` }
  }

  static async sendSubscriptionSuccess(userId: string) {
    const supabase = await createAdminClient()
    const { data: user } = await supabase.auth.admin.getUserById(userId)
    const email = user.user?.email

    if (!email) return

    await this.send({
      to: email,
      subject: "Welcome to the Registry | GolfDraw",
      html: `
        <h1>Your Impact Journey Begins</h1>
        <p>Your subscription is now active. 20% of your fee is currently authorized for your chosen mission.</p>
        <p>Log your scores now to enter the next draw cycle.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Enter Scores</a>
      `
    })
  }

  static async sendDrawResults(drawId: string, participants: { email: string, isWinner: boolean }[]) {
    const winners = participants.filter(p => p.isWinner)
    const general = participants.filter(p => !p.isWinner)

    // Notify Winners individually
    for (const winner of winners) {
      await this.send({
        to: winner.email,
        subject: "🎉 YOU WON! | GolfDraw Result",
        html: `
          <h1>Congratulations!</h1>
          <p>Your certified performance in the latest draw has earned you a prize.</p>
          <p>Please log in to your dashboard to view your award and upload proof.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings">Claim Prize</a>
        `
      })
    }

    // Notify general participants in bulk if supported, or individual loop
    if (general.length > 0) {
      await this.send({
        to: general.map(g => g.email),
        subject: "The Draw Results are In | GolfDraw",
        html: `
          <h1>Latest Results Certified</h1>
          <p>The latest draw cycle is complete. View the official results and your impact report now.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View Results</a>
        `
      })
    }
  }

  static async sendVerificationUpdate(userId: string, status: 'approved' | 'rejected') {
    const supabase = await createAdminClient()
    const { data: user } = await supabase.auth.admin.getUserById(userId)
    const email = user.user?.email

    if (!email) return

    await this.send({
      to: email,
      subject: `Claim ${status === 'approved' ? 'Verified' : 'Update'} | GolfDraw`,
      html: `
        <h1>Verification Status: ${status.toUpperCase()}</h1>
        <p>${status === 'approved' 
          ? "Your scorecard proof has been verified. Payout is now being processed." 
          : "There was an issue with your scorecard proof. Please review the admin notes in your dashboard."}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings">View Dashboard</a>
      `
    })
  }
}
