---
oj: dmy
pid: '321'
title: '[R51G]组合数论'
difficulty: NOI
tags:
  - 数论
  - 组合数学
  - 生成函数
  - NTT
timeLimit: 2.5s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$。

## 思路

记固定 $i$ 时的和为 $F_i$。把 $j=0$ 这一项补入不会改变答案，有

$$
F_i=i\sum_{j=0}^{i}\frac{j}{\gcd(i,j)}\binom{i}{j}
$$

注意到

$$
\gcd(i,j)=\gcd(i,i-j),\qquad \binom{i}{j}=\binom{i}{i-j}
$$

因此把第 $j$ 项和第 $i-j$ 项配对，二者的下标之和为 $i$，可得

$$
F_i=\frac{i^2}{2}\sum_{j=0}^{i}\frac{1}{\gcd(i,j)}\binom{i}{j}
$$

定义数论函数 $h$ 满足

$$
\frac{1}{m}=\sum_{d\mid m}h(d)
$$

它可以通过约数容斥预处理：先令 $h(m)=m^{-1}$，再按从小到大的顺序，把已经求出的 $h(d)$ 从所有 $d$ 的更大倍数中减去。于是

$$
\begin{aligned}
F_i
&=\frac{i^2}{2}\sum_{j=0}^{i}\binom{i}{j}
  \sum_{d\mid i,\ d\mid j}h(d)\\
&=\frac{i^2}{2}\sum_{d\mid i}h(d)L(i,d),
\end{aligned}
$$

其中

$$
L(i,d)=\sum_{\substack{0\le j\le i\\d\mid j}}\binom{i}{j}
$$

把 $i$ 写成 $dt$。令

$$
A_d(x)=\sum_{k\ge 0}\frac{x^k}{(dk)!}
$$

则

$$
L(dt,d)=(dt)!\,[x^t]A_d(x)^2
$$

所以每个 $d$ 所需的全部 $L(dt,d)$，本质上是序列 $\frac{1}{(dk)!}$ 与自身的卷积。

直接对所有 $d$ 做完整 NTT 的常数较大，代码采用三段处理：

- 当 $d\le 16$ 时，维护 $dp_r=\sum_{j\equiv r\pmod d}\binom{s}{j}$。加入一个元素后的转移为 $dp'_r=dp_r+dp_{r-1}$；每经过 $d$ 次转移，当前 $dp_0$ 就是 $L(dt,d)$。
- 当 $d>16$ 且 $\lfloor n/d\rfloor\le 192$ 时，卷积很短，利用对称性直接计算每个系数。
- 其余情况使用 NTT 求序列的自卷积。

最后枚举 $d$ 和 $t$，把

$$
\frac{(dt)^2}{2}h(d)L(dt,d)
$$

累加到答案中。

## 复杂度

设小值阈值为 $D=16$，短卷积阈值为 $B=192$。时间复杂度为

$$
O(nD^2+nB+n\log^2 n)=O(n\log^2 n)
$$

空间复杂度为 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

let MOD: Int64 = 998244353
let ROOT: Int64 = 3
let INV_TWO: Int64 = 499122177

func powMod(base: Int64, exponent: Int64): Int64 {
    var a = base
    var e = exponent
    var result: Int64 = 1
    while (e > 0) {
        if (e % 2 == 1) {
            result = result * a % MOD
        }
        a = a * a % MOD
        e /= 2
    }
    return result
}

// 正变换采用 DIF，输入为自然顺序，输出为位逆序。
func forwardNtt(a: Array<Int64>, roots: Array<Int64>): Unit {
    let size = a.size
    var length = size
    while (length >= 2) {
        let half = length / 2
        var start: Int64 = 0
        while (start < size) {
            var j: Int64 = 0
            while (j < half) {
                let x = a[start + j]
                let y = a[start + j + half]
                var sum = x + y
                if (sum >= MOD) {
                    sum -= MOD
                }
                var difference = x - y
                if (difference < 0) {
                    difference += MOD
                }
                a[start + j] = sum
                a[start + j + half] = difference * roots[half + j] % MOD
                j += 1
            }
            start += length
        }
        length /= 2
    }
}

// 逆变换采用 DIT，输入为位逆序，输出为自然顺序。
func inverseNtt(a: Array<Int64>, inverseRoots: Array<Int64>): Unit {
    let size = a.size
    var length: Int64 = 2
    while (length <= size) {
        let half = length / 2
        var start: Int64 = 0
        while (start < size) {
            var j: Int64 = 0
            while (j < half) {
                let x = a[start + j]
                let y = a[start + j + half] * inverseRoots[half + j] % MOD
                var sum = x + y
                if (sum >= MOD) {
                    sum -= MOD
                }
                var difference = x - y
                if (difference < 0) {
                    difference += MOD
                }
                a[start + j] = sum
                a[start + j + half] = difference
                j += 1
            }
            start += length
        }
        length *= 2
    }

    let inverseSize = powMod(size % MOD, MOD - 2)
    var i: Int64 = 0
    while (i < size) {
        a[i] = a[i] * inverseSize % MOD
        i += 1
    }
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())

    let fact = Array<Int64>(n + 1, { _ => 1 })
    var i: Int64 = 1
    while (i <= n) {
        fact[i] = fact[i - 1] * i % MOD
        i += 1
    }

    let inverseFact = Array<Int64>(n + 1, { _ => 1 })
    inverseFact[n] = powMod(fact[n], MOD - 2)
    i = n
    while (i >= 1) {
        inverseFact[i - 1] = inverseFact[i] * i % MOD
        i -= 1
    }

    // h 满足 1 / x = sum_{d | x} h[d]，这里做约数容斥。
    let h = Array<Int64>(n + 1, { _ => 0 })
    i = 1
    while (i <= n) {
        h[i] = fact[i - 1] * inverseFact[i] % MOD
        i += 1
    }
    var divisor: Int64 = 1
    while (divisor <= n) {
        var multiple = divisor * 2
        while (multiple <= n) {
            h[multiple] -= h[divisor]
            if (h[multiple] < 0) {
                h[multiple] += MOD
            }
            multiple += divisor
        }
        divisor += 1
    }

    let scale = Array<Int64>(n + 1, { _ => 0 })
    i = 1
    while (i <= n) {
        scale[i] = i * i % MOD * INV_TWO % MOD
        i += 1
    }

    var maximumLength: Int64 = 1
    while (maximumLength < n * 2 + 1) {
        maximumLength *= 2
    }
    let roots = Array<Int64>(maximumLength, { _ => 0 })
    let inverseRoots = Array<Int64>(maximumLength, { _ => 0 })
    var half: Int64 = 1
    while (half < maximumLength) {
        let root = powMod(ROOT, (MOD - 1) / (half * 2))
        let inverseRoot = powMod(root, MOD - 2)
        roots[half] = 1
        inverseRoots[half] = 1
        var j: Int64 = 1
        while (j < half) {
            roots[half + j] = roots[half + j - 1] * root % MOD
            inverseRoots[half + j] = inverseRoots[half + j - 1] * inverseRoot % MOD
            j += 1
        }
        half *= 2
    }

    var answer: Int64 = 0
    let smallLimit: Int64 = if (n < 16) { n } else { 16 }

    // d 较小时，用循环背包维护二项式系数按下标模 d 的和。
    divisor = 1
    while (divisor <= smallLimit) {
        let d = divisor
        let count = n / d
        var current = Array<Int64>(d, { _ => 0 })
        var next = Array<Int64>(d, { _ => 0 })
        current[0] = 1
        var t: Int64 = 1
        while (t <= count) {
            var step: Int64 = 0
            while (step < d) {
                var residue: Int64 = 0
                while (residue < d) {
                    let previous = if (residue == 0) { d - 1 } else { residue - 1 }
                    var value = current[residue] + current[previous]
                    if (value >= MOD) {
                        value -= MOD
                    }
                    next[residue] = value
                    residue += 1
                }
                let temporary = current
                current = next
                next = temporary
                step += 1
            }
            let index = d * t
            let term = scale[index] * h[d] % MOD * current[0] % MOD
            answer += term
            if (answer >= MOD) {
                answer -= MOD
            }
            t += 1
        }
        divisor += 1
    }

    let directLimit: Int64 = 192
    divisor = smallLimit + 1
    while (divisor <= n) {
        let d = divisor
        let count = n / d
        if (count <= directLimit) {
            var t: Int64 = 1
            while (t <= count) {
                var coefficient: Int64 = 0
                var left: Int64 = 0
                while (left * 2 < t) {
                    let right = t - left
                    let product = inverseFact[d * left] * inverseFact[d * right] % MOD
                    var add = product + product
                    if (add >= MOD) {
                        add -= MOD
                    }
                    coefficient += add
                    if (coefficient >= MOD) {
                        coefficient -= MOD
                    }
                    left += 1
                }
                if (left * 2 == t) {
                    let middle = inverseFact[d * left]
                    coefficient += middle * middle % MOD
                    if (coefficient >= MOD) {
                        coefficient -= MOD
                    }
                }
                let index = d * t
                let lacunarySum = fact[index] * coefficient % MOD
                let term = scale[index] * h[d] % MOD * lacunarySum % MOD
                answer += term
                if (answer >= MOD) {
                    answer -= MOD
                }
                t += 1
            }
        } else {
            var transformLength: Int64 = 1
            while (transformLength < count * 2 + 1) {
                transformLength *= 2
            }
            let polynomial = Array<Int64>(transformLength, { _ => 0 })
            var k: Int64 = 0
            while (k <= count) {
                polynomial[k] = inverseFact[d * k]
                k += 1
            }
            forwardNtt(polynomial, roots)
            k = 0
            while (k < transformLength) {
                polynomial[k] = polynomial[k] * polynomial[k] % MOD
                k += 1
            }
            inverseNtt(polynomial, inverseRoots)

            var t: Int64 = 1
            while (t <= count) {
                let index = d * t
                let lacunarySum = fact[index] * polynomial[t] % MOD
                let term = scale[index] * h[d] % MOD * lacunarySum % MOD
                answer += term
                if (answer >= MOD) {
                    answer -= MOD
                }
                t += 1
            }
        }
        divisor += 1
    }

    println(answer)
}
```
