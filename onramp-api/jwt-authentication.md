# JWT Authentication

A JSON Web Token (JWT) is a secure method of authenticating API calls used by Coinbase Developer Platform.
They combine encryption and access management in a single token, offering a robust security layer compared to traditional API keys.

## Generating a JWT

Regardless of which [code snippet](#code-samples) you use, follow these steps:

1. Replace `key name` and `key secret` with your key name and private key. `key secret` is a multi-line key and newlines must be preserved to properly parse the key. Do this on one line with `\n` escaped newlines, or with a multi-line string.
2. Update the `request_path` and `request_host or url` variables as needed depending on which endpoint is being targeted.
3. Run the generation script that prints the command `export JWT=...`.
4. Run the generated command to save your JWT.

<Warning>
  Your JWT expires after 2 minutes, after which all requests are unauthenticated.
</Warning>

### Code samples for ECDSA Keys

The easiest way to generate a JWT is to use the built-in functions in our SDKs. See the relevant product docs like
[Advanced Trade SDK](/coinbase-app/authentication-authorization/api-key-authentication), or  [CDP SDK](https://coinbase.github.io/coinbase-sdk-nodejs/index.html#md:initialization),
for examples.

These code samples are for ECDSA Signature algorithm keys. [Ed25519 code samples](#code-samples-for-ed25519-keys) below.

<Tabs groupId="programming-language">
  <Tab value="python" title="Python">
    1. Install dependencies `PyJWT` and `cryptography`.

    ```
    pip install PyJWT==2.8.0
    pip install cryptography==42.0.5
    ```

    2. Update the `request_path` and `request_host` variables as needed depending on which endpoint is being targeted.
    3. In the console, run: `python main.py` (or whatever your file name is).
    4. Set the JWT to that output, or export the JWT to the environment with `export JWT=$(python main.py)`.
    5. Make your request, example `curl -H "Authorization: Bearer $JWT" 'https://api.coinbase.com/api/v3/brokerage/accounts'`

    ```python [expandable] lines wrap
    import jwt
    from cryptography.hazmat.primitives import serialization
    import time
    import secrets

    key_name       = "organizations/{org_id}/apiKeys/{key_id}"
    key_secret     = "-----BEGIN EC PRIVATE KEY-----\nYOUR PRIVATE KEY\n-----END EC PRIVATE KEY-----\n"
    request_method = "GET"
    request_host   = "api.coinbase.com"
    request_path   = "/api/v3/brokerage/accounts"
    def build_jwt(uri):
        private_key_bytes = key_secret.encode('utf-8')
        private_key = serialization.load_pem_private_key(private_key_bytes, password=None)
        jwt_payload = {
            'sub': key_name,
            'iss': "cdp",
            'nbf': int(time.time()),
            'exp': int(time.time()) + 120,
            'uri': uri,
        }
        jwt_token = jwt.encode(
            jwt_payload,
            private_key,
            algorithm='ES256',
            headers={'kid': key_name, 'nonce': secrets.token_hex()},
        )
        return jwt_token
    def main():
        uri = f"{request_method} {request_host}{request_path}"
        jwt_token = build_jwt(uri)
        print(jwt_token)
    if __name__ == "__main__":
        main()
    ```
  </Tab>

  <Tab value="javascript" title="JavaScript">
    1. Install jsonwebtoken.

    ```
    npm install jsonwebtoken
    ```

    2. Update the `request_path` and `url` variables as needed depending on which endpoint is being targeted.
    3. In the console, run: `node main.js` (or whatever your file name is).
    4. Set JWT to that output, or export the JWT to environment with `export JWT=$(node main.js)`.
    5. Make your request, example `curl -H "Authorization: Bearer $JWT" 'https://api.coinbase.com/api/v3/brokerage/accounts'`

    ```javascript [expandable] lines wrap
    const { sign } = require("jsonwebtoken");
    const crypto = require("crypto");

    const key_name = "organizations/{org_id}/apiKeys/{key_id}";
    const key_secret =
      "-----BEGIN EC PRIVATE KEY-----\nYOUR PRIVATE KEY\n-----END EC PRIVATE KEY-----\n";
    const request_method = "GET";
    const url = "api.coinbase.com";
    const request_path = "/api/v3/brokerage/accounts";

    const algorithm = "ES256";
    const uri = request_method + " " + url + request_path;

    const token = sign(
      {
        iss: "cdp",
        nbf: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 120,
        sub: key_name,
        uri,
      },
      key_secret,
      {
        algorithm,
        header: {
          kid: key_name,
          nonce: crypto.randomBytes(16).toString("hex"),
        },
      }
    );
    console.log("export JWT=" + token);
    ```
  </Tab>

  <Tab value="typescript" title="TypeScript">
    1. Install the JSON Web Token and TypeScript dependencies:

    ```bash lines wrap
    npm install jsonwebtoken
    npm install @types/jsonwebtoken
    npm install -g typescript
    ```

    2. Create a TypeScript file named `main.ts` and add the following code:

    ```typescript [expandable] lines wrap
    import * as jwt from 'jsonwebtoken';
    import * as crypto from 'crypto';

    const keyName = 'organizations/{org_id}/apiKeys/{key_id}';
    const keySecret = `-----BEGIN EC PRIVATE KEY-----
    YOUR PRIVATE KEY
    -----END EC PRIVATE KEY-----`;
    const requestMethod = 'GET';
    const requestHost = 'api.coinbase.com';
    const requestPath = '/api/v3/brokerage/accounts';
    const algorithm = 'ES256';

    const uri = `${requestMethod} ${requestHost}${requestPath}`;

    const generateJWT = (): string => {
        const payload = {
        iss: 'cdp',
        nbf: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 120,
        sub: keyName,
        uri,
        };

        const header = {
        alg: algorithm,
        kid: keyName,
        nonce: crypto.randomBytes(16).toString('hex'),
        };

        return jwt.sign(payload, keySecret, { algorithm, header });
    };

    const main = () => {
        const token = generateJWT();
        console.log(token);
    };

    main();
    ```

    3. Update the `requestPath` and `requestHost` variables as needed depending on which endpoint is being targeted.

    4. Compile the TypeScript file to JavaScript:

    ```bash lines wrap
    tsc main.ts
    ```

    This will generate a `main.js` file.

    5. Run the generated JavaScript file:

    ```bash lines wrap
    node main.js
    ```

    6. Set the JWT to the output, or export the JWT to the environment with:

    ```bash lines wrap
    export JWT=$(node main.js)
    ```

    7. Make your request, example:

    ```bash lines wrap
    curl -H "Authorization: Bearer $JWT" 'https://api.coinbase.com/api/v3/brokerage/accounts'
    ```
  </Tab>

  <Tab value="go" title="Go">
    1. Create a new directory and generate a Go file called `main.go`.
    2. Paste the Go snippet below into `main.go`.
    3. Update the `requestPath` and `requestHost` variables as needed depending on which endpoint is being targeted.
    4. Run `go mod init jwt-generator` and `go mod tidy` to generate `go.mod` and `go.sum` to manage your dependencies.
    5. In the console, run `go run main.go`. This outputs the command, `export JWT=`.
    6. Set your JWT with the generated output, or export the JWT to the environment with `export JWT=$(go run main.go)`.
    7. Make your request, for example `curl -H "Authorization: Bearer $JWT" 'https://api.coinbase.com/api/v3/brokerage/accounts'`

    ```go [expandable] lines wrap
    package main

    import (
    	"crypto/rand"
    	"crypto/x509"
    	"encoding/pem"
    	"fmt"
    	"math"
    	"math/big"
    	"time"

    	log "github.com/sirupsen/logrus"
    	"gopkg.in/go-jose/go-jose.v2"
    	"gopkg.in/go-jose/go-jose.v2/jwt"
    )

    const (
    	keyName       = "organizations/{org_id}/apiKeys/{key_id}"
    	keySecret     = "-----BEGIN EC PRIVATE KEY-----\nYOUR PRIVATE KEY\n-----END EC PRIVATE KEY-----\n"
    	requestMethod = "GET"
    	requestHost   = "api.coinbase.com"
    	requestPath   = "/api/v3/brokerage/accounts"
    )

    type APIKeyClaims struct {
    	*jwt.Claims
    	URI string `json:"uri"`
    }

    func buildJWT(uri string) (string, error) {
    	block, _ := pem.Decode([]byte(keySecret))
    	if block == nil {
    		return "", fmt.Errorf("jwt: Could not decode private key")
    	}

    	key, err := x509.ParseECPrivateKey(block.Bytes)
    	if err != nil {
    		return "", fmt.Errorf("jwt: %w", err)
    	}

    	sig, err := jose.NewSigner(
    		jose.SigningKey{Algorithm: jose.ES256, Key: key},
    		(&jose.SignerOptions{NonceSource: nonceSource{}}).WithType("JWT").WithHeader("kid", keyName),
    	)
    	if err != nil {
    		return "", fmt.Errorf("jwt: %w", err)
    	}

    	cl := &APIKeyClaims{
    		Claims: &jwt.Claims{
    			Subject:   keyName,
    			Issuer:    "cdp",
    			NotBefore: jwt.NewNumericDate(time.Now()),
    			Expiry:    jwt.NewNumericDate(time.Now().Add(2 * time.Minute)),
    		},
    		URI: uri,
    	}
    	jwtString, err := jwt.Signed(sig).Claims(cl).CompactSerialize()
    	if err != nil {
    		return "", fmt.Errorf("jwt: %w", err)
    	}
    	return jwtString, nil
    }

    var max = big.NewInt(math.MaxInt64)

    type nonceSource struct{}

    func (n nonceSource) Nonce() (string, error) {
    	r, err := rand.Int(rand.Reader, max)
    	if err != nil {
    		return "", err
    	}
    	return r.String(), nil
    }

    func main() {
    	uri := fmt.Sprintf("%s %s%s", requestMethod, requestHost, requestPath)

    	jwt, err := buildJWT(uri)

    	if err != nil {
    		log.Errorf("error building jwt: %v", err)
    	}
    	fmt.Println(jwt)
    }
    ```
  </Tab>

  <Tab value="Ruby" title="Ruby">
    1. Install dependencies `JWT` and `OpenSSL`.

    ```
    gem install JWT
    gem install OpenSSL
    ```

    2. Update the `request_path` and `request_host` variables as needed depending on which endpoint is being targeted.
    3. In the console, run: `ruby main.rb` (or whatever your file name is).
    4. Set the JWT to that output, or export the JWT to the environment with `export JWT=$(ruby main.rb)`.

    ```ruby [expandable] lines wrap
    require 'jwt'
    require 'openssl'
    require 'time'
    require 'securerandom'

    Key_name = "organizations/{org_id}/apiKeys/{key_id}"
    Key_secret = "-----BEGIN EC PRIVATE KEY-----\nYOUR PRIVATE KEY\n-----END EC PRIVATE KEY-----\n"

    request_method = "GET"
    request_host   = "api.coinbase.com"
    request_path = "/api/v3/brokerage/accounts"


    def build_jwt(uri)
        header = {
          typ: 'JWT',
          kid: Key_name,
          nonce: SecureRandom.hex(16)
        }

        claims = {
          sub: Key_name,
          iss: 'cdp',
          aud: ['cdp_service'],
          nbf: Time.now.to_i,
          exp: Time.now.to_i + 120, # Expiration time: 2 minute from now.
          uri: uri
        }

        private_key = OpenSSL::PKey::read(Key_secret)
        JWT.encode(claims, private_key, 'ES256', header)
      end


    token = build_jwt("#{request_method.upcase} #{request_host}#{request_path}")
    puts token
    ```
  </Tab>

  <Tab value="php" title="PHP">
    1. Add PHP dependencies with Composer (for JWT and environment variable management):

    ```
    composer require firebase/php-jwt
    composer require vlucas/phpdotenv
    ```

    2. Copy the code sample below and update the `request_path` and `url` variables as needed depending on which endpoint is being targeted.

    3. Run `generate_jwt.php` (or a filename of your choice).

    4. Output the JWT to the command line and use a shell script to export it:

    ```
    export JWT=$(php generate_jwt.php)
    ```

    5. Make your request, for example:

    ```
    curl -H "Authorization: Bearer $JWT" 'https://api.coinbase.com/api/v3/brokerage/accounts'
    ```

    ```php [expandable] lines wrap
    <?php
    require 'vendor/autoload.php';
    use Firebase\JWT\JWT;
    use \Dotenv\Dotenv;

    // Load environment variables
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    function buildJwt() {
        $keyName = $_ENV['NAME'];
        $keySecret = str_replace('\\n', "\n", $_ENV['PRIVATE_KEY']);
        $request_method = 'GET';
        $url = 'api.coinbase.com';
        $request_path = '/api/v3/brokerage/accounts';

        $uri = $request_method . ' ' . $url . $request_path;
        $privateKeyResource = openssl_pkey_get_private($keySecret);
        if (!$privateKeyResource) {
            throw new Exception('Private key is not valid');
        }
        $time = time();
        $nonce = bin2hex(random_bytes(16));  // Generate a 32-character hexadecimal nonce
        $jwtPayload = [
            'sub' => $keyName,
            'iss' => 'cdp',
            'nbf' => $time,
            'exp' => $time + 120,  // Token valid for 120 seconds from now
            'uri' => $uri,
        ];
        $headers = [
            'typ' => 'JWT',
            'alg' => 'ES256',
            'kid' => $keyName,  // Key ID header for JWT
            'nonce' => $nonce  // Nonce included in headers for added security
        ];
        $jwtToken = JWT::encode($jwtPayload, $privateKeyResource, 'ES256', $keyName, $headers);
        return $jwtToken;
    }
    ```
  </Tab>

  <Tab value="java" title="Java">
    1. Add Java Dependencies to your project's Maven or Gradle configuration:

    ```
    nimbus-jose-jwt (version 9.39), bcpkix-jdk18on (version 1.78), and java-dotenv (version 5.2.2)
    ```

    2. Copy the code sample below and update the `url` variable as needed depending on which endpoint is being targeted.

    3. Compile your Java application to generates a JWT, for example:

    ```
    mvn compile
    ```

    4. Capture and export the JWT output from your Java application to an environment variable:

    ```
    export JWT=$(mvn exec:java -Dexec.mainClass=Main)
    ```

    5. Make an API Request, for example:

    ```
    curl -H "Authorization: Bearer $JWT" 'https://api.coinbase.com/api/v3/brokerage/accounts'
    ```

    ```java [expandable] lines wrap
    import com.nimbusds.jose.*;
    import com.nimbusds.jose.crypto.*;
    import com.nimbusds.jwt.*;
    import java.security.interfaces.ECPrivateKey;
    import java.util.Map;
    import java.util.HashMap;
    import java.time.Instant;
    import java.util.Base64;
    import org.bouncycastle.jce.provider.BouncyCastleProvider;
    import org.bouncycastle.openssl.PEMParser;
    import org.bouncycastle.openssl.jcajce.JcaPEMKeyConverter;
    import java.security.spec.PKCS8EncodedKeySpec;
    import java.security.KeyFactory;
    import java.io.StringReader;
    import java.security.PrivateKey;
    import java.security.Security;
    import io.github.cdimascio.dotenv.Dotenv;

    public class Main {
        public static void main(String[] args) throws Exception {
            // Register BouncyCastle as a security providerx
            Security.addProvider(new BouncyCastleProvider());

            // Load environment variables
            Dotenv dotenv = Dotenv.load();
            String privateKeyPEM = dotenv.get("PRIVATE_KEY").replace("\\n", "\n");
            String name = dotenv.get("NAME");

            // create header object
            Map<String, Object> header = new HashMap<>();
            header.put("alg", "ES256");
            header.put("typ", "JWT");
            header.put("kid", name);
            header.put("nonce", String.valueOf(Instant.now().getEpochSecond()));

            // create uri string for current request
            String requestMethod = "GET";
            String url = "api.coinbase.com/api/v3/brokerage/accounts";
            String uri = requestMethod + " " + url;

            // create data object
            Map<String, Object> data = new HashMap<>();
            data.put("iss", "cdp");
            data.put("nbf", Instant.now().getEpochSecond());
            data.put("exp", Instant.now().getEpochSecond() + 120);
            data.put("sub", name);
            data.put("uri", uri);

            // Load private key
            PEMParser pemParser = new PEMParser(new StringReader(privateKeyPEM));
            JcaPEMKeyConverter converter = new JcaPEMKeyConverter().setProvider("BC");
            Object object = pemParser.readObject();
            PrivateKey privateKey;

            if (object instanceof PrivateKey) {
                privateKey = (PrivateKey) object;
            } else if (object instanceof org.bouncycastle.openssl.PEMKeyPair) {
                privateKey = converter.getPrivateKey(((org.bouncycastle.openssl.PEMKeyPair) object).getPrivateKeyInfo());
            } else {
                throw new Exception("Unexpected private key format");
            }
            pemParser.close();

            // Convert to ECPrivateKey
            KeyFactory keyFactory = KeyFactory.getInstance("EC");
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKey.getEncoded());
            ECPrivateKey ecPrivateKey = (ECPrivateKey) keyFactory.generatePrivate(keySpec);

            // create JWT
            JWTClaimsSet.Builder claimsSetBuilder = new JWTClaimsSet.Builder();
            for (Map.Entry<String, Object> entry : data.entrySet()) {
                claimsSetBuilder.claim(entry.getKey(), entry.getValue());
            }
            JWTClaimsSet claimsSet = claimsSetBuilder.build();

            JWSHeader jwsHeader = new JWSHeader.Builder(JWSAlgorithm.ES256).customParams(header).build();
            SignedJWT signedJWT = new SignedJWT(jwsHeader, claimsSet);

            JWSSigner signer = new ECDSASigner(ecPrivateKey);
            signedJWT.sign(signer);

            String sJWT = signedJWT.serialize();
            System.out.println(sJWT);
        }
    }
    ```
  </Tab>

  <Tab value="cpp" title="C++">
    1. Install C++ project dependencies like so:

    ```
    apt-get update
    apt-get install libcurlpp-dev libssl-dev
    git clone https://github.com/Thalhammer/jwt-cpp
    cd jwt-cpp
    mkdir build && cd build
    cmake ..
    make
    make install
    ```

    2. After you've saved your code to a file name, for example main.cpp, update the `request_path` and `url` variables as needed depending on which endpoint is being targeted.

    3. Compile the program:

    ```
    g++ main.cpp -o myapp -lcurlpp -lcurl -lssl -lcrypto -I/usr/local/include -L/usr/local/lib -ljwt -std=c++17
    ```

    4. Capture and export the JWT output from your C++ application to an environment variable:

    ```
    export JWT=$(./myapp)
    ```

    5. Make an API Request, for example:

    ```
    curl -H "Authorization: Bearer $JWT" 'https://api.coinbase.com/api/v3/brokerage/accounts'
    ```

    ```cpp [expandable] lines wrap
    #include <iostream>
    #include <sstream>
    #include <string>
    #include <curlpp/cURLpp.hpp>
    #include <curlpp/Easy.hpp>
    #include <curlpp/Options.hpp>
    #include <jwt-cpp/jwt.h>
    #include <openssl/evp.h>
    #include <openssl/ec.h>
    #include <openssl/pem.h>
    #include <openssl/rand.h>

    std::string create_jwt() {
        // Set request parameters
        std::string key_name = "organizations/{org_id}/apiKeys/{key_id}";
        std::string key_secret = "-----BEGIN EC PRIVATE KEY-----\nYOUR PRIVATE KEY\n-----END EC PRIVATE KEY-----\n";
        std::string request_method = "GET";
        std::string url = "api.coinbase.com";
        std::string request_path = "/api/v3/brokerage/accounts";
        std::string uri = request_method + " " + url + request_path;

        // Generate a random nonce
        unsigned char nonce_raw[16];
        RAND_bytes(nonce_raw, sizeof(nonce_raw));
        std::string nonce(reinterpret_cast<char*>(nonce_raw), sizeof(nonce_raw));

        // Create JWT token
        auto token = jwt::create()
            .set_subject(key_name)
            .set_issuer("cdp")
            .set_not_before(std::chrono::system_clock::now())
            .set_expires_at(std::chrono::system_clock::now() + std::chrono::seconds{120})
            .set_payload_claim("uri", jwt::claim(uri))
            .set_header_claim("kid", jwt::claim(key_name))
            .set_header_claim("nonce", jwt::claim(nonce))
            .sign(jwt::algorithm::es256(key_name, key_secret));

        return token;
    };

    int main() {
        try {
            std::string token = create_jwt();
            std::cout << "Generated JWT Token: " << token << std::endl;
        } catch (const std::exception& e) {
            std::cerr << "Error: " << e.what() << std::endl;
            return 1;
        }
        return 0;
    };
    ```
  </Tab>

  <Tab value="dotnet" title="C#">
    1. Create a new console project by running the following command:

    ```
    dotnet new console
    ```

    2. Open the Program.cs file in a text editor or IDE (e.g., Visual Studio Code, Visual Studio, or any text editor). Replace the contents of Program.cs with the code sample below and update the `endpoint` variable as needed depending on which endpoint is being targeted.

    3. Install C# project dependencies like so:

    ```
    dotnet add package Microsoft.IdentityModel.Tokens
    dotnet add package System.IdentityModel.Tokens.Jwt
    dotnet add package Jose-JWT
    ```

    4. Build the project by running the following command:

    ```
    dotnet build
    ```

    5. Run the project by running the following command:

    ```
    dotnet run
    ```

    5. Make an API Request, for example:

    ```
    curl -H "Authorization: Bearer $JWT" 'https://api.coinbase.com/api/v3/brokerage/accounts'
    ```

    ```dotnet [expandable] lines wrap
    // Environment is .NET 4.7.2
    using System;
    using System.IdentityModel.Tokens.Jwt;
    using System.Net.Http;
    using System.Security.Cryptography;
    using Microsoft.IdentityModel.Tokens;
    using Org.BouncyCastle.Crypto;
    using Org.BouncyCastle.Crypto.Parameters;
    using Org.BouncyCastle.OpenSsl;
    using Org.BouncyCastle.Security;
    using System.IO;

    namespace JwtTest
    {
        internal class Program
        {
            static void Main(string[] args)
            {
                string name = "organizations/{org_id}/apiKeys/{key_id}";
                string cbPrivateKey = "-----BEGIN EC PRIVATE KEY-----\nYOUR PRIVATE KEY\n-----END EC PRIVATE KEY-----\n";

                string endpoint = "api.coinbase.com/api/v3/brokerage/products";
                string token = GenerateToken(name, cbPrivateKey, $"GET {endpoint}");

                Console.WriteLine($"Generated Token: {token}");
                Console.WriteLine("Calling API...");
                Console.WriteLine(CallApiGET($"https://{endpoint}", token));
            }

            static string GenerateToken(string name, string privateKeyPem, string uri)
            {
                // Load EC private key using BouncyCastle
                var ecPrivateKey = LoadEcPrivateKeyFromPem(privateKeyPem);

                // Create security key from the manually created ECDsa
                var ecdsa = GetECDsaFromPrivateKey(ecPrivateKey);
                var securityKey = new ECDsaSecurityKey(ecdsa);

                // Signing credentials
                var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.EcdsaSha256);

                var now = DateTimeOffset.UtcNow;

                // Header and payload
                var header = new JwtHeader(credentials);
                header["kid"] = name;
                header["nonce"] = GenerateNonce(); // Generate dynamic nonce

                var payload = new JwtPayload
                {
                    { "iss", "coinbase-cloud" },
                    { "sub", name },
                    { "nbf", now.ToUnixTimeSeconds() },
                    { "exp", now.AddMinutes(2).ToUnixTimeSeconds() },
                    { "uri", uri }
                };

                var token = new JwtSecurityToken(header, payload);

                var tokenHandler = new JwtSecurityTokenHandler();
                return tokenHandler.WriteToken(token);
            }

            // Method to generate a dynamic nonce
            static string GenerateNonce(int length = 64)
            {
                byte[] nonceBytes = new byte[length / 2]; // Allocate enough space for the desired length (in hex characters)
                using (var rng = RandomNumberGenerator.Create())
                {
                    rng.GetBytes(nonceBytes);
                }
                return BitConverter.ToString(nonceBytes).Replace("-", "").ToLower(); // Convert byte array to hex string
            }

            // Method to load EC private key from PEM using BouncyCastle
            static ECPrivateKeyParameters LoadEcPrivateKeyFromPem(string privateKeyPem)
            {
                using (var stringReader = new StringReader(privateKeyPem))
                {
                    var pemReader = new PemReader(stringReader);
                    var keyPair = pemReader.ReadObject() as AsymmetricCipherKeyPair;
                    if (keyPair == null)
                        throw new InvalidOperationException("Failed to load EC private key from PEM");

                    return (ECPrivateKeyParameters)keyPair.Private;
                }
            }

            // Method to convert ECPrivateKeyParameters to ECDsa
            static ECDsa GetECDsaFromPrivateKey(ECPrivateKeyParameters privateKey)
            {
                var q = privateKey.Parameters.G.Multiply(privateKey.D).Normalize();
                var qx = q.AffineXCoord.GetEncoded();
                var qy = q.AffineYCoord.GetEncoded();

                var ecdsaParams = new ECParameters
                {
                    Curve = ECCurve.NamedCurves.nistP256, // Adjust if you're using a different curve
                    Q =
                    {
                        X = qx,
                        Y = qy
                    },
                    D = privateKey.D.ToByteArrayUnsigned()
                };

                return ECDsa.Create(ecdsaParams);
            }

            // Method to call the API with a GET request
            static string CallApiGET(string url, string bearerToken = "")
            {
                using (var client = new HttpClient())
                {
                    using (var request = new HttpRequestMessage(HttpMethod.Get, url))
                    {
                        if (!string.IsNullOrEmpty(bearerToken))
                            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", bearerToken);
                        var response = client.SendAsync(request).Result;

                        if (response != null)
                            return response.Content.ReadAsStringAsync().Result;
                        else
                            return "";
                    }
                }
            }
        }
    }

    ```
  </Tab>
</Tabs>

### Code samples for Ed25519 Keys

These code samples are for Ed25519 Signature algorithm keys.

<Tabs groupId="programming-language">
  <Tab value="javascript" title="JavaScript">
    1. Install the `libsodium-wrappers` and `base64url` libraries.

    ```
    npm i libsodium-wrappers base64url
    ```

    2. Update the `request_path` and `url` variables as needed depending on which endpoint is being targeted.
    3. In the console, run: `node main.js` (or whatever your file name is).
    4. Set JWT to that output, or export the JWT to environment with `export JWT=$(node main.js)`.
    5. Make your request, example `curl -H "Authorization: Bearer $JWT" 'https://api.coinbase.com/api/v3/brokerage/accounts'`

    ```javascript [expandable] lines wrap
    const _sodium = require('libsodium-wrappers');
    const base64url = require("base64url");
    const crypto = require('crypto');

    const key_name = "KEY_ID";
    const key_secret = "PRIVATE_KEY";
    const request_method = 'GET';
    const url = 'api.coinbase.com';
    const request_path = '/api/v3/brokerage/products';
    const uri = request_method + ' ' + url + request_path;

    const getJWT = async () => {  
        await _sodium.ready;
        const sodium = _sodium;
        const privateKey = key_secret;
        const payload = {
            iss: 'cdp',
            nbf: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 120,
            sub: key_name,
            uri,
         };  
         const {headerAndPayloadBase64URL, keyBuf} = encode(payload, privateKey, "EdDSA");
         const signature = sodium.crypto_sign_detached(headerAndPayloadBase64URL, keyBuf); 
         const signatureBase64url = base64url(Buffer.from(signature));
         console.log(`${headerAndPayloadBase64URL}.${signatureBase64url}`)
    };

    const encode = (payload, key, alg) => {
        const header = {
            typ: "JWT",
            alg,
            kid: key_name,
            nonce: crypto.randomBytes(16).toString('hex'),
        };
        const headerBase64URL = base64url(JSON.stringify(header));
        const payloadBase64URL = base64url(JSON.stringify(payload));
        const headerAndPayloadBase64URL = `${headerBase64URL}.${payloadBase64URL}`;
        const keyBuf = Buffer.from(key, "base64");
        return {headerAndPayloadBase64URL, keyBuf};
    };

    getJWT();
    ```
  </Tab>

  <Tab value="typescript" title="TypeScript">
    1. Install the `libsodium-wrappers` and `base64url` libraries and dev dependencies.

    ```
    npm i libsodium-wrappers base64url
    npm i --save-dev typescript ts-node @types/base64url @types/node
    ```

    2. Create `tsconfig.json` file

    ```
    {
        "compilerOptions": {
          "target": "ES2020",
          "module": "CommonJS",
          "strict": true,
          "esModuleInterop": true,
          "outDir": "./dist"
        },
        "include": ["*.ts"]
    }
    ```

    3. Update the `request_path` and `url` variables as needed depending on which endpoint is being targeted.
    4. In the console, run: `npx ts-node main.ts` (or whatever your file name is).
    5. Set JWT to that output, or export the JWT to environment with `export JWT=$(npx ts-node main.ts)`.
    6. Make your request, example `curl -H "Authorization: Bearer $JWT" 'https://api.coinbase.com/api/v3/brokerage/accounts'`

    ```typescript [expandable] lines wrap
    // jwt.ts
    import sodium from 'libsodium-wrappers';
    import base64url from 'base64url';
    import crypto from 'crypto';

    const KEY_NAME = 'KEY_ID';
    const KEY_SECRET = 'PRIVATE_KEY';

    const REQUEST_METHOD = 'GET';
    const HOST = 'api.coinbase.com';
    const PATH = '/api/v3/brokerage/products';
    const URI = `${REQUEST_METHOD} ${HOST}${PATH}`;

    interface JwtPayload {
      iss: string;
      nbf: number;
      exp: number;
      sub: string;
      uri: string;
    }

    interface Encoded {
      headerAndPayloadBase64URL: string;
      keyBuf: Buffer;
    }

    function encode(payload: JwtPayload, key: string, alg: string): Encoded {
      const header = {
        typ: 'JWT',
        alg,
        kid: KEY_NAME,
        nonce: crypto.randomBytes(16).toString('hex'),
      };

      const headerBase64URL = base64url(JSON.stringify(header));
      const payloadBase64URL = base64url(JSON.stringify(payload));
      const headerAndPayloadBase64URL = `${headerBase64URL}.${payloadBase64URL}`;
      const keyBuf = Buffer.from(key, 'base64');

      return { headerAndPayloadBase64URL, keyBuf };
    }

    export async function getJWT(): Promise<string> {
      await sodium.ready;
      const payload: JwtPayload = {
        iss: 'cdp',
        nbf: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 120,
        sub: KEY_NAME,
        uri: URI,
      };

      const { headerAndPayloadBase64URL, keyBuf } = encode(payload, KEY_SECRET, 'EdDSA');
      const signature = sodium.crypto_sign_detached(headerAndPayloadBase64URL, keyBuf);
      const signatureBase64url = base64url(Buffer.from(signature));

      return `${headerAndPayloadBase64URL}.${signatureBase64url}`;
    }

    // If run as a script
    if (require.main === module) {
      getJWT()
        .then(jwt => console.log(jwt))
        .catch(err => {
          console.error('Failed to generate JWT:', err);
          process.exit(1);
        });
    }
    ```
  </Tab>

  <Tab value="go" title="Go">
    1. Update the `request_path` and `url` variables as needed depending on which endpoint is being targeted.
    2. In the console, run: `go run main.go` (or whatever your file name is).
    3. Set JWT to that output, or export the JWT to environment with `export JWT=$(go run main.go)`.
    4. Make your request, example `curl -H "Authorization: Bearer $JWT" 'https://api.coinbase.com/api/v3/brokerage/accounts'`

    ```go [expandable] lines wrap
    package main

    import (
    	"crypto/ed25519"
    	"crypto/rand"
        "encoding/hex"
    	"encoding/base64"
    	"encoding/json"
    	"fmt"
    	"time"
    )

    const (
    	KeyID     = "KEY_ID"
    	KeySecret = "PRIVATE_KEY"
    	Method    = "GET"
    	Host      = "api.coinbase.com"
    	Path      = "/api/v3/brokerage/products"
    )

    type header struct {
    	Typ   string `json:"typ"`
    	Alg   string `json:"alg"`
    	Kid   string `json:"kid"`
    	Nonce string `json:"nonce"`
    }

    type payload struct {
    	Iss string `json:"iss"`
    	Nbf int64  `json:"nbf"`
    	Exp int64  `json:"exp"`
    	Sub string `json:"sub"`
    	URI string `json:"uri"`
    }

    func base64URL(data []byte) string {
    	return base64.RawURLEncoding.EncodeToString(data)
    }

    func randomNonce() (string, error) {
        b := make([]byte, 16)
        if _, err := rand.Read(b); err != nil {
            return "", err
        }
        return hex.EncodeToString(b), nil
    }

    func main() {
    	uri := fmt.Sprintf("%s %s%s", Method, Host, Path)
    	

    	now := time.Now().Unix()
    	pl := payload{"cdp", now, now + 120, KeyID, uri}

    	nonce, err := randomNonce()
        if err != nil {
            panic("failed to generate nonce: " + err.Error())
        }
        h := header{"JWT", "EdDSA", KeyID, nonce}

    	hBytes, _ := json.Marshal(h)
    	plBytes, _ := json.Marshal(pl)

    	unsigned := fmt.Sprintf("%s.%s", base64URL(hBytes), base64URL(plBytes))

    	keyBytes, err := base64.StdEncoding.DecodeString(KeySecret)
    	if err != nil {
    		panic("invalid private key: " + err.Error())
    	}

    	signature := ed25519.Sign(ed25519.PrivateKey(keyBytes), []byte(unsigned))
    	jwt := fmt.Sprintf("%s.%s", unsigned, base64URL(signature))

    	fmt.Println(jwt)
    }
    ```
  </Tab>
</Tabs>

## Using a JWT

Use your generated JWT by including it as a [bearer token](https://swagger.io/docs/specification/v3_0/authentication/bearer-authentication/) within your request:

<Warning>
  Note that your JWT is only valid for a period of **2 minutes** from the time it is generated. You'll need to re-generate your JWT before it expires to ensure uninterrupted access to our APIs.
</Warning>

```bash Shell lines wrap
curl -L -X <HTTP_METHOD> "<API_ENDPOINT_URL>" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

Here's a sample request to the [Get Asset by ID](/api-reference/rest-api/assets/get-assets-by-id) endpoint, using a redacted JWT:

```bash Shell  lines wrap
curl -L -X POST "https://api.cdp.coinbase.com/platform/v1/networks/base-mainnet/assets/BTC" \
  -H "Authorization: Bearer eyJ...IYg" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

***

## Learn More about JWTs

JWTs are a secure method of authenticating API calls, especially crucial for platforms handling sensitive financial information. They combine encryption and access management in a single token, offering a robust security layer compared to traditional API keys.

At Coinbase, upholding our motto "The most trusted name in Crypto" means ensuring the utmost security in every aspect of our operations. As digital threats evolve, so must our methods of safeguarding user data. This is why we employ JSON Web Tokens (JWTs) for API authentication—a format that not only verifies identity but also encrypts critical information within a secure token framework.

### What is a JSON Web Token (JWT)?

A JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties. At Coinbase, JWTs encapsulate the claims in a JSON object that can be digitally signed or encrypted. Each JWT consists of three parts: the Header, the Payload, and the Signature. We'll dive deeper into each of these below.

<img src="https://mintlify.s3.us-west-1.amazonaws.com/coinbase-prod/get-started/authentication/images/cdp-jwt-structure-of-JSON-web-token.png" />

### The Anatomy of a JWT

Understanding the structure of a JSON Web Token (JWT) is key to leveraging its full potential for secure API interactions. A JWT consists of three distinct parts:

* **Header**: This section declares the type of the token, JWT, and the algorithm used for the signature, such as ES256 in Coinbase's case, which are critical for ensuring the security and integrity of the token.
* **Payload**: Containing claims such as the user's identity, role, and token expiration time. At Coinbase, this data is crucial for enabling not just authentication but also for ensuring that each transaction aligns with our user's privileges and security requirements.
* **Signature**: The final component is a cryptographic signature that verifies that the token comes from a trusted source and has not been altered. This ensures that the transaction is both secure and verifiable.
  This structure not only ensures compliance with rigorous security standards but also supports transparent and trustworthy transactions across our platform.

### Why Use JWTs for API Authentication?

In the realm of financial transactions, where security cannot be compromised, JWTs offer a sophisticated method for authenticating API calls that goes beyond traditional approaches. At Coinbase, our commitment to being "The most trusted name in Crypto" necessitates a framework that not only enhances security but also efficiently handles the scale and complexity of modern financial systems.

JWTs excel in this environment due to several key features:

* **Improved Security Features**: JWTs provide a robust mechanism for ensuring data integrity and authenticity. By using advanced algorithms for signatures, each token is secured against tampering, crucial for protecting sensitive financial data.
* **Stateless Nature**: Unlike session-based authentication, JWTs do not require server-side storage to verify each request. This statelessness enables our systems to scale dynamically without the overhead of session management, critical in handling high volumes of transactions seamlessly.
* **Detailed Control Over User Permissions and Token Expiration**: JWTs contain detailed claims that specify user roles and access privileges, allowing for fine-grained access control. Furthermore, token expiration is explicitly managed within the JWT, ensuring that permissions are timely and securely revoked when necessary.

These features make JWTs an integral part of our security strategy, ensuring that every API interaction remains secure, scalable, and aligned with our stringent security standards.

<Info>
  When dealing with APIs across different environments or with multiple endpoints, it's wise to extract and verify each component of the URI:

  1. **HTTP Method**: Ensure it matches the requirements (e.g., GET, POST).
  2. **Host**: Check if it corresponds to the correct API server (e.g., api.coinbase.com, api.developer.coinbase.com).
  3. **Endpoint Path**: Verify the path that corresponds to the specific API functionality you need (e.g., /api/v3/brokerage/accounts).
</Info>

### Common Pitfalls and How to Avoid Them

* **Dynamic Parameters**: Passing the HTTP method, and the correctly formatted URL domain and URL path. This would require the variables assigned to these parameters to be dynamic in nature and to be set, at runtime to the API endpoint being queried.
* **Token Expiration**: manage the token expiration to a timeframe which makes sense for your use-case (ie. adding more time for latency if using a proxy.) For reference, our samples all set the expiration to 120 seconds, or 2 minutes.
* **Format and Import API Keys**: keep original key formatting and import both the name and private key appropriately into the JWT creation file. If running into authentication issues after following all the above steps, consider adding debugging to see what the actual private key and key name resolve to at runtime.
* **Clock Skew Issues**: JWTs depend on synchronized timestamps for `nbf` (Not Before) and `exp` (Expiration) claims. Even small discrepancies between server and client clocks can cause tokens to be rejected. Ensure systems are synchronized using a reliable time source, such as NTP.
* **Improper Header Configuration**: Ensure the JWT header includes the correct `alg` (Algorithm) and `kid` (Key ID). Misconfigurations can result in failed verifications. Follow Coinbase guidelines to set these fields accurately.
* **Payload Bloat**: Avoid adding unnecessary data to the JWT payload. Overloading the payload can increase token size, leading to performance issues and potential exposure of sensitive information. Include only essential claims needed for the specific API request.

#### Further JWT related reading:

* [Official JWT documentation](https://datatracker.ietf.org/doc/html/rfc7519)
* [JWT.io](http://JWT.io) debugging tool
