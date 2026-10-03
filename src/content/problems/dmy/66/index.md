---
oj: dmy
pid: '66'
title: '[R11F] 二维gcd和2'
difficulty: 提高
tags:
  - 数学
  - 欧拉函数
  - 数论
timeLimit: 2s
memoryLimit: 1024m
---

> 数据规模：$1 \le N \le 5\times 10^7$，答案对 $998244353$ 取模。

## 思路

要求 $\sum_{i=1}^N\sum_{j=1}^N\gcd(i,j)$，直接枚举 $i,j$ 是 $O(N^2)$，无法承受。换一个角度，按 $\gcd(i,j)$ 的值分类贡献。

定义 $s[k]$ 为满足 $1\le i\le k$ 且 $1\le j\le k$ 且 $\gcd(i,j)=1$ 的二元组 $(i,j)$ 数量。若 $\gcd(i,j)=x$，等价于 $\gcd(i/x,j/x)=1$，所以 $\gcd(i,j)=x$ 的二元组个数恰好是 $s[\lfloor N/x\rfloor]$，答案即为

$$\sum_{x=1}^{N} x\cdot s\!\left\lfloor\frac{N}{x}\right\rfloor$$

接下来计算 $s[k]$。除 $(1,1)$ 外，其余互质对可分为 $i<j$ 与 $i>j$ 两类。引入欧拉函数 $\varphi(i)$ 表示 $1\sim i$ 中与 $i$ 互质的数的个数，则 $j$ 固定时 $i<j$ 且互质的 $i$ 有 $\varphi(j)$ 个，对称地 $i>j$ 同理，于是

$$s[k]=1+2\sum_{y=2}^{k}\varphi(y)$$

预处理出 $\varphi$ 的前缀和 $S[k]=\sum_{y=2}^{k}\varphi(y)$，则 $s[k]=1+2S[k]$，整个答案可在 $O(N)$ 内累加。

**算法瓶颈在于预处理欧拉函数。** 用埃氏筛可以在 $O(N\log\log N)$ 内求出所有 $\varphi$：初始化 $\varphi(i)=i$，对每个素数 $p$，把它所有倍数 $j$ 的 $\varphi(j)$ 乘以 $(1-1/p)$，即 $\varphi(j)\leftarrow \varphi(j)/p\cdot(p-1)$。

复杂度：时间 $O(N\log\log N)$，空间 $O(N)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let MOD: Int64 = 998244353
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    // 埃氏筛欧拉函数 phi[1..n]，用 UInt32 节省内存，无需额外素数表
    // 初始化 phi[i]=i，对每个素数 i，把它的所有倍数 j 的 phi[j] *= (1-1/i) = phi[j] - phi[j]/i
    var phi = Array<UInt32>(n + 1, { x: Int64 => UInt32(x) })
    var i: Int64 = 2
    while (i <= n) {
        if (Int64(phi[i]) == i) {
            // i 是素数
            var j = i
            while (j <= n) {
                phi[j] = UInt32(Int64(phi[j]) / i * (i - 1))
                j += i
            }
        }
        i += 1
    }
    // 原地将 phi[k] 转为前缀和 phisum[k] = sum_{y=2}^k phi[y] % MOD（< MOD 可存 UInt32）
    // s[k] = 1 + 2*phisum[k] 为 1..k 中互质对 (i,j) 数量
    var run: Int64 = 0
    var k: Int64 = 1
    while (k <= n) {
        if (k >= 2) {
            run = (run + Int64(phi[k])) % MOD
        }
        phi[k] = UInt32(run)
        k += 1
    }
    // 答案 = sum_{x=1}^n x * s[floor(n/x)]
    // x 与 s 都 < MOD，直接相乘会溢出 Int64，先 (x % MOD) * sval % MOD
    var ans: Int64 = 0
    var x: Int64 = 1
    while (x <= n) {
        let q = n / x
        let sval = (1 + 2 * Int64(phi[q])) % MOD
        ans = (ans + (x % MOD) * sval) % MOD
        x += 1
    }
    println(ans)
}
```

</details>

要点：

- 按 $\gcd$ 的值分类：$\gcd(i,j)=x$ 的对数就是 $\lfloor N/x\rfloor$ 范围内互质对数 $s[\lfloor N/x\rfloor]$，把 $O(N^2)$ 降维到对 $x$ 的 $O(N)$ 求和。
- 互质对数用欧拉函数前缀和表示：$s[k]=1+2\sum_{y=2}^{k}\varphi(y)$，关键是把 $(1,1)$ 单独算，其余按 $i<j$、$i>j$ 对称翻倍。
- 欧拉函数用埃氏筛 $O(N\log\log N)$ 求出，利用 $\varphi$ 是积性函数，对素数 $p$ 的倍数 $j$ 执行 $\varphi(j)\leftarrow\varphi(j)/p\cdot(p-1)$。
- **内存优化**：$N$ 最大 $5\times 10^7$，数组用 `UInt32`（$\varphi(i)\le i-1<5\times 10^7$ 且取模后 $<998244353$ 都能存下），把 $400\,\text{MB}$ 压缩到 $200\,\text{MB}$，并省去单独的素数表，避免内存超限。
- **防溢出**：前缀和与答案累加全程对 $MOD$ 取模；计算 $x\cdot s$ 时先 `x % MOD` 再相乘，避免 `Int64` 溢出；筛法中的乘法通过 `Int64(phi[j])` 临时提升精度后再写回 `UInt32`。
