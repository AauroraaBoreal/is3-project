// import { ChatBody } from '@/types/types';
// import { OpenAIStream } from '@/utils/chatStream';

// export const runtime = 'edge';

// export async function GET(req: Request): Promise<Response> {
//   try {
//     const { inputCode, model, apiKey } = (await req.json()) as ChatBody;

//     let apiKeyFinal;
//     if (apiKey) {
//       apiKeyFinal = apiKey;
//     } else {
//       apiKeyFinal = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
//     }

//     const stream = await OpenAIStream(inputCode, model, apiKeyFinal);

//     return new Response(stream);
//   } catch (error) {
//     console.error(error);
//     return new Response('Error', { status: 500 });
//   }
// }

// export async function POST(req: Request): Promise<Response> {
//   try {
//     const { inputCode, model, apiKey } = (await req.json()) as ChatBody;

//     let apiKeyFinal;
//     if (apiKey) {
//       apiKeyFinal = apiKey;
//     } else {
//       apiKeyFinal = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
//     }

//     const stream = await OpenAIStream(inputCode, model, apiKeyFinal);

//     return new Response(stream);
//   } catch (error) {
//     console.error(error);
//     return new Response('Error', { status: 500 });
//   }
// }

import { ChatBody } from '@/types/types';

export const runtime = 'edge';

export async function GET(req: Request): Promise<Response> {
  return new Response('Use POST method instead', { status: 405 });
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { inputCode } = (await req.json()) as ChatBody;

    // Enviar solicitud POST al servidor Flask que corre en localhost:5000
    const chatbotResponse = await fetch('http://localhost:5000/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: inputCode }), // Enviar mensaje del usuario
    });

    const data = await chatbotResponse.json();

    // Retornar la respuesta del chatbot al frontend
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response('Error', { status: 500 });
  }
}
